#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B — COUVERTURE MULTI-APPAREILS AVANT FERMETURE V2 (18/09/2026).

CE QUE CE DOSSIER CORRIGE. La passe precedente proposait de comparer `count(ft_jetons)` a
`count(ft_comptes)`. Michel a eu raison de refuser : un compte peut porter PLUSIEURS jetons
actifs (telephone + PC), donc ce rapport ne mesure rien. Le chiffre qui decide est
**COMPTES SANS AUCUN JETON ACTIF**, et il se compte depuis `ft_comptes`, pas depuis le
registre.

[!!] LA GARDE CENTRALE RESTE CELLE DU SCHEMA — mais elle a ici une LIMITE qu'il faut dire :
     `ft_jetons` est versionnee (migration 0001), donc ses colonnes sont verifiables ;
     `ft_comptes` NE L'EST PAS (table creee a la main avant le versionnement). Ses colonnes
     ne peuvent etre CONFIRMEES que par les endroits du code servi qui l'ecrivent. Le
     generateur mesure cette confirmation au lieu de la supposer.

[!!] ET LA SECONDE GARDE EST L ABSENCE DE SECRET : la requete ne rend que des AGREGATS —
     aucune adresse, aucun hache, aucun libelle d'appareil ne sort de la base.

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
    SCRATCH, 'S2B-COUVERTURE-MULTI-APPAREILS-18-09-2026.pdf')

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

MIG1 = lire('supabase/migrations/20260917_0001_ft_jetons.sql')
MIG2 = lire('supabase/migrations/20260917_0002_rpc_s2b.sql')
MIG1S = sans_commentaires_sql(MIG1)
MIG2S = sans_commentaires_sql(MIG2)
SB = sans_commentaires_js(lire('supabase.js'))
W = sans_commentaires_js(lire('worker.js'))
CJ = lire('Code.js')
SETUP = lire('setup.js')

# ══ 1. LE SCHEMA DE ft_jetons — verifiable, parce qu il est versionne ═══════════════════
_bloc = re.search(r'create table if not exists public\.ft_jetons\s*\((.*?)\n\);', MIG1S, re.S)
g(_bloc is not None, 'la table ft_jetons est introuvable : rien ne peut etre verifie')
CORPS_T = _bloc.group(1)
COLONNES = set(re.findall(r'^\s*([a-z_]+)\s+(?:text|timestamptz|boolean)\b', CORPS_T, re.M))
for _c in ('hachage', 'compte', 'cree_le', 'revoque', 'revoque_le', 'appareil'):
    g(_c in COLONNES, 'la colonne « %s » a disparu de ft_jetons' % _c)

# ⭐⭐ LE MULTI-APPAREILS EST PROUVE PAR LA FORME DE LA TABLE, pas par une intention :
#    la cle primaire est le HACHE, et `compte` ne porte AUCUNE contrainte d unicite.
g(re.search(r'^\s*hachage\s+text\s+primary key', CORPS_T, re.M) is not None,
  'la cle primaire n est plus le hache : un compte ne pourrait plus porter plusieurs jetons')
g(re.search(r'^\s*compte\s+text\s+not null\s*,?\s*$', CORPS_T, re.M) is not None,
  'la colonne compte a change de contrainte : verifier qu elle n est pas devenue unique')
g('unique' not in CORPS_T.lower(),
  'une contrainte d unicite est apparue dans ft_jetons : le multi-appareils serait casse')
g('create index if not exists ft_jetons_compte_idx on public.ft_jetons (compte)' in MIG1S,
  'l index par compte a disparu : la recherche des appareils d un compte n est plus prevue')

# ══ 2. LA REVOCATION EST PAR APPAREIL, ET ELLE N ATTEINT QUE LUI ════════════════════════
_FN_REV = (re.search(
    r'create or replace function public\.ft_revoquer_jeton\b.*?\n\$\$;', MIG2, re.S) or [''])[0]
g('(p_hachage text)' in _FN_REV,
  'la revocation ne prend plus un hache : elle pourrait porter sur tout un compte')
g(re.search(r'where\s+hachage\s*=\s*p_hachage', _FN_REV) is not None,
  'la revocation ne vise plus UN hache : elle toucherait les autres appareils du compte')
g('compte' not in _FN_REV,
  'la revocation nomme le compte : elle pourrait atteindre les autres appareils')

_FN_ENR = (re.search(
    r'create or replace function public\.ft_enregistrer_instantane\b.*?\n\$\$;', MIG2, re.S)
    or [''])[0]
g(re.search(r'where\s+j\.hachage\s*=\s*p_hachage\s*\n\s*and\s+j\.revoque\s*=\s*false',
            _FN_ENR) is not None,
  'la resolution d identite ne filtre plus par hache ET non-revoque')

# ══ 3. LA CLE DE JOINTURE — ft_jetons.compte vaut ft_comptes.email ══════════════════════
# ⛔ ft_comptes N EST PAS VERSIONNEE : on ne peut pas lire ses colonnes. Ce qu on PEUT
#    prouver, c est que le code servi ecrit `v_compte` dans sa colonne `email`.
g(re.search(r'insert into public\.ft_comptes \(email, data, updated_at\)\s*\n\s*values '
            r'\(v_compte,', _FN_ENR) is not None,
  'le compte du registre n alimente plus ft_comptes.email : la jointure de la requete tombe')
g(re.search(r"create table[^\n]*ft_comptes", MIG1S + MIG2S) is None,
  'ft_comptes serait devenue versionnee : le dossier doit alors lire son schema, pas le deduire')

# ⭐ ET LES DEUX COTES NORMALISENT PAREIL — sinon « compte sans jeton » serait gonfle a tort.
g(re.search(r"var e = String\(email \|\| ''\)\.trim\(\)\.toLowerCase\(\);", CJ) is not None,
  'le registre S1 ne met plus l adresse en minuscules : la jointure pourrait rater en silence')
g(".trim().toLowerCase()" in SB,
  'l ancienne porte ne normalise plus l adresse : deux ecritures du meme compte divergeraient')

# ══ 4. LA CONCURRENCE — ce que fait le miroir, et ce que fait Apps Script ════════════════
g('set data = excluded.data, updated_at = now()' in _FN_ENR,
  'le miroir ne remplace plus l instantane en entier : la section concurrence est fausse')
# ⛔ AUCUN GARDE DE CONCURRENCE : pas de comparaison de version ni d horodatage a l ecriture.
g(re.search(r'do update\s*\n?\s*set data = excluded\.data, updated_at = now\(\);', _FN_ENR)
  is not None and 'where excluded' not in _FN_ENR,
  'un garde de concurrence est apparu dans le miroir : le dossier doit le decrire')
# ⭐ APPS SCRIPT, LUI, FUSIONNE CHAMP PAR CHAMP ET REFUSE UN RETRECISSEMENT BRUTAL.
g('if (body.sessions !== undefined) {' in CJ,
  'Apps Script ne fusionne plus champ par champ : « omettre = laisser intact » tombe')
g(re.search(r'const SEUIL_MINI = 30, PART_MINI = 0\.6;', CJ) is not None,
  'le garde-fou anti-retrecissement d Apps Script a disparu')
# ⚠️ ET L OMISSION VOLONTAIRE, concue pour une destination QUI FUSIONNE.
g('sessions:S.histTronque?undefined:' in sans_commentaires_js(SETUP),
  'l omission des seances tronquees a disparu : la section « asymetrie » est fausse')

# ══ 5. L ETAT DU CHANTIER ═══════════════════════════════════════════════════════════════
g('p_email: email' in SB, 'V2 serait fermee : ce dossier decrit un etat intermediaire')
g("const SB_VOIE = 'worker'" in SB, 'la voie servie n est plus le Worker')
g("p_compte: moi.email" in W,
  'le Worker n inscrit plus l adresse resolue par le pont : la jointure change de sens')

# ══ 6. LES REQUETES PUBLIEES — agregats seuls, aucune ecriture ══════════════════════════
SQL_COUVERTURE = """select
  (select count(*) from public.ft_comptes)                        as comptes_total,

  (select count(*) from public.ft_comptes c
    where exists (select 1 from public.ft_jetons j
                   where j.compte = c.email and not j.revoque))   as comptes_avec_jeton_actif,

  (select count(*) from public.ft_comptes c
    where not exists (select 1 from public.ft_jetons j
                       where j.compte = c.email and not j.revoque)) as comptes_sans_jeton_actif,

  (select count(*) from public.ft_jetons where not revoque)       as jetons_actifs_total,

  (select count(*) from (select j.compte from public.ft_jetons j
                          where not j.revoque
                          group by j.compte having count(*) > 1) m) as comptes_multi_appareils,

  (select count(*) from public.ft_jetons j
    where not exists (select 1 from public.ft_comptes c
                       where c.email = j.compte))                 as jetons_orphelins,

  (select count(distinct j.compte) from public.ft_jetons j
    where j.revoque
      and not exists (select 1 from public.ft_jetons k
                       where k.compte = j.compte and not k.revoque)) as comptes_seulement_revoques,

  (select count(*) - count(distinct lower(btrim(email)))
     from public.ft_comptes)                                      as comptes_en_double_de_casse;"""

SQL_REPARTITION = """select nb_appareils, count(*) as nb_comptes
from (select compte, count(*) as nb_appareils
        from public.ft_jetons
       where not revoque
       group by compte) t
group by nb_appareils
order by nb_appareils;"""

# ⛔ AUCUNE ECRITURE, AUCUNE COLONNE NOMINATIVE DANS LA SORTIE.
_SQL = (SQL_COUVERTURE + ' ' + SQL_REPARTITION).lower()
for _interdit in ('insert', 'update ', 'delete', 'drop', 'alter', 'revoke', 'grant', 'truncate'):
    g(_interdit not in _SQL,
      'la requete publiee contient « %s » : elle ne serait plus en lecture seule' % _interdit)
# ⭐⭐ L INVARIANT N EST PAS LE NOM DE LA COLONNE, C EST SA NATURE. Ma premiere version
#    refusait « comptes_multi_appareils » parce que le mot « appareil » y figure — elle
#    mesurait mon vocabulaire, pas la requete. >> *Ce qui protege ici, c est que CHAQUE
#    colonne rendue est un AGREGAT* : une valeur nominative ne peut pas sortir d un
#    `count()`. On decoupe donc la requete a chaque etiquette et on exige l agregat.
_items = re.split(r'\bas [a-z_]+\s*[,;]', SQL_COUVERTURE)[:-1]
_noms = re.findall(r'\bas ([a-z_]+)\s*[,;]', SQL_COUVERTURE)
g(len(_items) == len(_noms) == 8,
  'la requete ne rend plus 8 colonnes etiquetees : le decoupage du controle est perime')
for _item, _nom in zip(_items, _noms):
    g('count(' in _item,
      'la colonne « %s » n est pas un agregat : une valeur nominative pourrait sortir' % _nom)
for _col in set(re.findall(r'\bj\.([a-z_]+)\b', SQL_COUVERTURE)):
    g(_col in COLONNES, 'la requete nomme « j.%s », absente de ft_jetons' % _col)

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
                           fontSize=6.5, leading=8.1, textColor=ENCRE, spaceAfter=2),
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
RM = '<font color="#B26A00"><b>RISQUE LIMITE AU MIROIR</b></font>'

H = []
H.append(P('S2-B - couverture multi-appareils avant fermeture V2', 'titre'))
H.append(P('Force Tracker - 18 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>lecture seule ; aucune requete executee ; V2 non fermee</b>',
           'sous'))

# ── 1 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('1. Pourquoi la mesure precedente etait fausse', 'h1'))
H.append(encadre(
    'NOMBRE DE JETONS N EST PAS NOMBRE DE COMPTES COUVERTS',
    'La passe precedente proposait <font face="Courier">count(ft_jetons)</font> contre '
    '<font face="Courier">count(ft_comptes)</font>. <b>Ce rapport ne mesure rien</b> : un '
    'compte porte autant de jetons actifs qu il a d appareils, donc le premier nombre peut '
    'depasser le second sans qu un seul compte soit couvert de plus. <b>Le chiffre qui decide '
    'est « comptes SANS aucun jeton actif »</b>, et il se compte depuis '
    '<font face="Courier">ft_comptes</font>, jamais depuis le registre.'))

# ── 2 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('2. Le multi-appareils : ce que la table dit deja', 'h1'))
H.append(P('Ces points ne demandent aucune lecture de donnees : ils se lisent dans la '
           '<b>forme</b> de la table et des fonctions versionnees.', 'p'))
H.append(tableau(
    ['point', 'etat', 'ou il est mesure'],
    [['plusieurs jetons actifs pour un meme compte', PR,
      'cle primaire = <font face="Courier">hachage</font> ; '
      '<font face="Courier">compte</font> sans contrainte d unicite ; index non unique '
      '<font face="Courier">ft_jetons_compte_idx</font> pose expres'],
     ['chaque appareil a son propre jeton', PR,
      'une ligne par hache ; le libelle d appareil est un champ de la ligne'],
     ['revocation independante par appareil', PR,
      '<font face="Courier">ft_revoquer_jeton(p_hachage)</font> agit '
      '<font face="Courier">where hachage = p_hachage</font> et <b>ne nomme jamais le '
      'compte</b>'],
     ['revoquer un appareil ne bloque pas les autres', PR,
      'la resolution filtre <font face="Courier">hachage = p_hachage and revoque = false</font> '
      ': les autres lignes du compte sont intouchees'],
     ['le compte reste identifiable sans adresse choisie par le navigateur', PR,
      'le Worker inscrit <font face="Courier">p_compte: moi.email</font>, resolu par le pont ; '
      'la fonction d ecriture ne prend <b>aucune</b> adresse en parametre']],
    [50 * mm, 20 * mm, 96 * mm]))
H.append(P('Le commentaire de la migration le disait deja, et la forme de la table le tient : '
           '<i>« plusieurs jetons pour un compte : telephone, PC, futur Android, futur '
           'iPhone »</i>.', 'petit'))

# ── 3 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('3. La requete de couverture - agregats seuls', 'h1'))
H.append(P('<b>Deux adaptations, et il faut les connaitre avant d executer.</b>', 'p'))
H.append(tableau(
    ['adaptation', 'pourquoi'],
    [['« comptes avec jeton actif » se compte depuis <font face="Courier">ft_comptes</font>, '
      'pas par <font face="Courier">count(distinct compte)</font> sur le registre',
      'un jeton <b>orphelin</b> (pointant vers un compte absent) gonflerait le compteur. '
      'Avec cette forme, <b>avec + sans = total</b> par construction, et les orphelins sont '
      'comptes a part.'],
     ['une colonne de plus : <font face="Courier">comptes_en_double_de_casse</font>',
      'elle vaut 0 si la normalisation est bonne. <b>Un ecart signalerait deux lignes pour la '
      'meme personne</b>, donc un « compte sans jeton » qui n existe pas. '
      '<i>Verifie dans le code : les deux cotes appliquent deja '
      '<font face="Courier">trim().toLowerCase()</font> - la colonne est un filet, pas une '
      'suspicion.</i>']],
    [56 * mm, 110 * mm]))
H.append(bloc_code(SQL_COUVERTURE))
H.append(P('Et la repartition demandee (point 5), en agregats eux aussi :', 'p'))
H.append(bloc_code(SQL_REPARTITION))
H.append(encadre(
    'UNE LIMITE A DIRE : ft_comptes N EST PAS VERSIONNEE',
    '<font face="Courier">ft_jetons</font> vient d une migration, donc ses colonnes sont '
    '<b>verifiees</b> une par une par le generateur de ce dossier. '
    '<font face="Courier">ft_comptes</font>, elle, a ete creee a la main avant le '
    'versionnement : <b>son schema n existe nulle part dans le depot</b>. Ce qu on peut '
    'prouver, c est que le code servi ecrit dans '
    '<font face="Courier">ft_comptes (email, data, updated_at)</font> - donc la jointure '
    '<font face="Courier">j.compte = c.email</font> est la bonne. '
    '<i>Si la requete echoue sur un nom de colonne, c est cette dette-la qui parle, pas la '
    'requete.</i>'))

# ── 4 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('4. Deux telephones qui sauvegardent en meme temps', 'h1'))
H.append(tableau(
    ['question', 'reponse mesuree dans le code', 'etat'],
    [['le miroir remplace-t-il l instantane complet ?',
      '<b>oui</b> - <font face="Courier">set data = excluded.data</font> : le blob entier est '
      'remplace, il n y a aucune fusion', PR],
     ['derniere ecriture gagnante ?', '<b>oui</b>, sans condition', PR],
     ['un horodatage, une version, un garde de concurrence ?',
      '<font face="Courier">updated_at = now()</font> existe, mais <b>rien ne le lit a '
      'l ecriture</b> : ce n est pas un garde, c est une trace', PR],
     ['deux appareils peuvent-ils s ecraser dans le miroir ?', '<b>oui</b>', PR],
     ['Apps Script reste-t-il une source de verite independante ?',
      '<b>oui, et mieux que ca</b> : il fusionne <b>champ par champ</b> '
      '(<font face="Courier">if (body.X !== undefined)</font>) et <b>refuse un '
      'retrecissement brutal</b> de l historique (seuils 30 seances / 60 %)', PR],
     ['perte reelle, ou copie miroir momentanement plus ancienne ?',
      'la donnee vit dans Apps Script, qui n est pas touche par la course ; le miroir peut '
      'etre en retard, jamais la source', RM]],
    [44 * mm, 100 * mm, 22 * mm]))

H.append(encadre(
    'UNE ASYMETRIE QUI N AVAIT PAS ETE NOMMEE - ET QUI N EST PAS UNE COURSE',
    'Elle apparait en lisant les deux destinations cote a cote. Quand le stockage du telephone '
    'a sature, l application tronque l historique local et <b>omet volontairement le champ '
    '<font face="Courier">sessions</font></b> de la sauvegarde. Chez Apps Script, omettre un '
    'champ veut dire <b>« laisse l existant intact »</b> - c est exactement le but, et le '
    'commentaire du code le dit. Chez Supabase, <b>le blob est remplace en entier</b> : le '
    'champ omis <b>disparait de la copie miroir</b>. '
    '<i>Le meme geste protege une destination qui fusionne et appauvrit une destination qui '
    'remplace</i> - un comportement transpose d un contexte a un autre qui devient faux (R14), '
    'et le meme motif que S2-A : <b>un corps unique, deux destinations, deux semantiques</b>. '
    '<b>Consequence bornee : le miroir peut etre non seulement plus ancien, mais '
    'structurellement incomplet.</b> Aucune donnee n est perdue - Apps Script les garde, et '
    'son garde-fou anti-retrecissement joue en plus. <b>Rien n est corrige ici : c est un '
    'constat, et la decision appartient a Michel.</b>'))
H.append(P('<b>Ce qui n a PAS ete fait, et c est voulu :</b> aucun conflit n a ete provoque '
           'sur un vrai compte, aucune sauvegarde simultanee n a ete declenchee. '
           'Tout ce qui precede vient de la <b>lecture du code servi</b>. Ce qui reste '
           'donc ' + NP + ' : le comportement <b>observe</b> de deux telephones ecrivant a la '
           'meme seconde - personne ne l a mesure.', 'p'))

# ── 5 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('5. Verdict - tableau a remplir apres execution', 'h1'))
H.append(tableau(
    ['element', 'resultat'],
    [['comptes totaux', '<i>(a lire)</i>'],
     ['comptes avec au moins 1 jeton actif', '<i>(a lire)</i>'],
     ['<b>comptes sans jeton actif</b>', '<b><i>(le chiffre qui decide)</i></b>'],
     ['jetons actifs', '<i>(a lire)</i>'],
     ['comptes multi-appareils', '<i>(a lire)</i>'],
     ['jetons orphelins', '<i>(a lire)</i>'],
     ['comptes seulement revoques', '<i>(a lire)</i>'],
     ['comptes en double de casse', '<i>(attendu : 0)</i>']],
    [104 * mm, 62 * mm]))
H.append(P('<b>Aucune de ces cases n est remplie par deduction.</b> La requete n a pas ete '
           'executee : <font face="Courier">ft_jetons</font> est illisible par tous les roles '
           'de l API, <font face="Courier">service_role</font> compris, donc seul l editeur SQL '
           'du tableau de bord peut la lancer.', 'petit'))

H.append(P('6. Peut-on preparer la fermeture V2 ?', 'h1'))
H.append(encadre(
    'PREPARER : OUI. FERMER : NON - ET LA REGLE DE DECISION EST POSEE D AVANCE',
    'Ce qui manquait a la passe precedente est desormais nomme et mesurable. La regle, telle '
    'que Michel l a fixee : <b>si « comptes sans jeton actif » vaut 0, la couverture est '
    'complete cote comptes</b> ; <b>si le chiffre est superieur a 0, on n approche pas de la '
    'fermeture avant d avoir regarde ces comptes-la</b>. '
    '<i>Un compte sans jeton actif n est pas un compte en danger - Apps Script reste sa source '
    'de verite - mais c est un compte dont le filet s eteindrait en silence, et le silence est '
    'exactement ce qui a laisse la sauvegarde nocturne morte 36 jours.</i> '
    '<b>Et meme a 0, V2 ne se ferme pas dans cette passe</b> : c est une decision separee, avec '
    'accord explicite.'))

H.append(P('7. Ce que ce dossier ne fait pas', 'h1'))
H.append(P('<b>Aucune modification.</b> Aucune requete executee, aucun conflit provoque, '
           'aucun jeton cree ni revoque, aucun droit change. <b>V2 non fermee</b> - '
           '<font face="Courier">sbMirror</font> reste en place, non referencee, retour arriere '
           'en une ligne. <b>Aucune regle Douane touchee</b> : son verdict reste <b>continuer '
           'l observation</b>. Et l asymetrie du champ omis est <b>signalee, pas corrigee</b>.',
           'p'))

# ── controles de sortie ────────────────────────────────────────────────────────────────
_bt = ' '.join(TEXTES).lower()
_rendu = _bt + ' ' + ' '.join(CODES).lower()

for _mot, _msg in [
        ('v2 est fermee', 'le document annonce une fermeture qui n a pas eu lieu'),
        ('perte de donnees reelle', 'aucune perte reelle n est demontree'),
        ('regle inutile', 'aucune regle n est declaree inutile')]:
    g(_mot not in _bt, _msg)

for _mot, _pourquoi in (
        ('comptes sans jeton actif', 'le chiffre qui decide'),
        ('nombre de jetons n est pas nombre de comptes', 'la correction demandee par Michel'),
        ('risque limite au miroir', 'le classement du cas deux telephones'),
        ('preparer : oui', 'le verdict'),
        ('continuer l observation', 'le verdict Douane, conserve tel quel'),
        ('n est pas versionnee', 'la limite de ce qui est verifiable')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))

g(re.search(r'\b[0-9a-f]{32,}\b', _rendu) is None,
  'un hexadecimal long figure dans le document : hache complet, jeton ou cle')
g('@' not in _rendu.replace('&#64;', ''),
  'une adresse semble figurer dans le document')

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-B - couverture multi-appareils',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, %d colonnes ft_jetons verifiees, ft_comptes NON versionnee, '
      'requetes NON executees)' % (OUT, VERSION, GARDES[0], len(COLONNES)))
