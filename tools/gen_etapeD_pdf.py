#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2A2 — ETAPE D, GRANTS / ROLES / EXECUTE. Hors depot (regle d'or #14).

[!!] CE DOCUMENT CITE UNE MESURE EXTERIEURE AU DEPOT (les catalogues PostgreSQL, lus par
     Michel dans le tableau de bord). Ses gardes re-derivent chaque conclusion de cette
     mesure - et surtout ils la RECOUPENT AVEC ELLE-MEME : l'ACL en toutes lettres
     (`anon=rdDxtm/postgres`) est decodee et comparee aux privileges effectifs rendus par
     has_table_privilege(). Deux chemins, un seul resultat attendu. *S'ils se
     contredisaient, tout le raisonnement de ce dossier reposerait sur du sable.*

[!!] CE DOCUMENT CORRIGE DEUX DE MES PROPRES AFFIRMATIONS :
     - dossiers A et C : « postgres = superutilisateur ». MESURE : rolsuper = FALSE.
       Le contournement de la RLS est reel mais vient d'ailleurs (rolbypassrls + exemption
       du proprietaire) ;
     - dossier C : « si un role dispose du droit UPDATE... ». MESURE : ni anon ni
       authenticated ne l'ont. La porte laterale d'ecriture est fermee au niveau GRANT.

[!!] LES REFUS DE CONCLURE : « anon a le privilege SELECT » ne doit JAMAIS devenir « la cle
     publique peut lire les sauvegardes » - la RLS est une seconde couche, et seul le test
     de bout en bout (E) tranche. La decision purge/rotation reste NON.

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
    SCRATCH, 'S2A2-ETAPE-D-GRANTS-ROLES-RESULTAT-REEL-16-09-2026.pdf')

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
# LE RESULTAT BRUT, TEL QUE MICHEL L'A RAPPORTE — la SOURCE de tout ce qui suit.
# ═══════════════════════════════════════════════════════════════════════════════════════
TABLE = {
    'nom': 'ft_comptes',
    'proprietaire': 'postgres',
    'rls_activee': True,
    'force_rls': False,
    'acl_texte': '{postgres=arwdDxtm/postgres,anon=rdDxtm/postgres,'
                 'authenticated=rdDxtm/postgres,service_role=arwdDxtm/postgres}',
}
ROLES = {   # rolname : (superuser, bypassrls, inherit, canlogin)
    'anon':          (False, False, True, False),
    'authenticated': (False, False, True, False),
    'postgres':      (False, True,  True, True),
    'service_role':  (False, True,  True, False),
}
PRIVS = {   # has_table_privilege() sur public.ft_comptes
    'anon':          {'select': True,  'insert': False, 'update': False, 'delete': True},
    'authenticated': {'select': True,  'insert': False, 'update': False, 'delete': True},
    'postgres':      {'select': True,  'insert': True,  'update': True,  'delete': True},
    'service_role':  {'select': True,  'insert': True,  'update': True,  'delete': True},
}
FONCTION = {
    'nom': 'ft_miroir',
    'arguments': 'p_email text, p_data jsonb',
    'proprietaire': 'postgres',
    'security_definer': True,
    'acl_texte': '{postgres=X/postgres,anon=X/postgres,'
                 'authenticated=X/postgres,service_role=X/postgres}',
    'execute': {'anon': True, 'authenticated': True, 'service_role': True, 'postgres': True},
    'beneficiaires': ['postgres', 'anon', 'authenticated', 'service_role'],
    'donneur': 'postgres',
}
# [!!] Le bloc 'age_des_lignes' ajoute a la requete N'EST PAS revenu dans le resultat :
# la requete executee etait la version precedente. Ce n'est pas une panne, c'est une
# mesure qui reste a prendre - et ce document doit le DIRE au lieu de le passer sous silence.
AGE_DES_LIGNES_MESURE = None

# rappels des etapes precedentes (mesures, pas supposes)
POLICIES_CMDS = {'INSERT', 'UPDATE'}          # etape C : ni SELECT ni DELETE
LIGNES = 10                                   # etape B

# ═══════════════════════════════════════════════════════════════════════════════════════
# [!!] LE RECOUPEMENT : l'ACL EN LETTRES CONTRE has_table_privilege()
# ═══════════════════════════════════════════════════════════════════════════════════════
ACL_LETTRES = {'a': 'insert', 'r': 'select', 'w': 'update', 'd': 'delete',
               'D': 'truncate', 'x': 'references', 't': 'trigger', 'm': 'maintain'}


def decoder_acl(txt):
    """{role=lettres/donneur,...} -> {role: {privilege: True}}"""
    out = {}
    for item in txt.strip('{}').split(','):
        cible, _, reste = item.partition('=')
        lettres, _, _donneur = reste.partition('/')
        out[cible or 'PUBLIC'] = {ACL_LETTRES[l] for l in lettres if l in ACL_LETTRES}
    return out


ACL = decoder_acl(TABLE['acl_texte'])
g(set(ACL) == set(PRIVS),
  'l ACL en lettres et les privileges effectifs ne portent pas sur les memes roles '
  '(%s contre %s)' % (sorted(ACL), sorted(PRIVS)))
for _r, _p in PRIVS.items():
    for _priv, _attendu in _p.items():
        g((_priv in ACL[_r]) == _attendu,
          'CONTRADICTION DANS LA MESURE : has_table_privilege dit %s=%s pour %s, mais l ACL '
          'en lettres dit le contraire. Ce document ne peut pas raisonner sur deux mesures '
          'qui se contredisent.' % (_priv, _attendu, _r))

# ── les faits que le document affirme, re-derives ─────────────────────────────────────
ANON_SELECT = PRIVS['anon']['select']
ANON_INSERT = PRIVS['anon']['insert']
ANON_UPDATE = PRIVS['anon']['update']
ANON_DELETE = PRIVS['anon']['delete']
ANON_TRUNCATE = 'truncate' in ACL['anon']
AUTH_ECRIT = PRIVS['authenticated']['insert'] or PRIVS['authenticated']['update']
PORTE_LATERALE = (ANON_INSERT or ANON_UPDATE or AUTH_ECRIT)

g(ANON_SELECT and not ANON_INSERT and not ANON_UPDATE,
  'le profil de anon a change : ce document est bati sur « SELECT oui, INSERT/UPDATE non »')
g(not PORTE_LATERALE,
  'une porte laterale d ecriture directe existe desormais : ce document repond NON a D-Q14')
g(ANON_DELETE and ANON_TRUNCATE,
  'anon ne porte plus DELETE et TRUNCATE : c est le signalement le plus important du '
  'document, il faudrait le retirer au lieu de le laisser')
g('SELECT' not in POLICIES_CMDS and 'DELETE' not in POLICIES_CMDS,
  'les policies de l etape C ont change : le raisonnement « privilege present, policy '
  'absente » de ce document tombe')
g(FONCTION['execute']['anon'] is True,
  'anon ne peut plus executer ft_miroir : c est la confirmation de V2 par ce document, et '
  'c etait une prediction annoncee AVANT la mesure')
g('PUBLIC' not in FONCTION['beneficiaires'],
  'PUBLIC apparait dans l ACL de la fonction : ce document affirme que les droits EXECUTE '
  'sont nommes role par role, ce qui rend un retrait cible possible')
g(set(FONCTION['beneficiaires']) == set(FONCTION['execute']),
  'l ACL de la fonction et les droits effectifs ne portent pas sur les memes roles')

# ── LA CHAINE QUI EXPLIQUE L'ECRITURE, chaque maillon mesure ───────────────────────────
MEME_PROPRIETAIRE = TABLE['proprietaire'] == FONCTION['proprietaire']
PG_SUPER = ROLES['postgres'][0]
PG_BYPASS = ROLES['postgres'][1]
EXEMPTION_PROPRIETAIRE = MEME_PROPRIETAIRE and not TABLE['force_rls']
g(FONCTION['security_definer'] is True, 'ft_miroir n est plus SECURITY DEFINER')
g(MEME_PROPRIETAIRE,
  'la table et la fonction n ont plus le meme proprietaire : le premier maillon de la '
  'chaine expliquee par ce document tombe')
g(TABLE['force_rls'] is False,
  'FORCE RLS serait actif : l exemption du proprietaire ne jouerait plus, et ce document '
  'explique l inverse')
g(PG_SUPER is False,
  'postgres serait superutilisateur : ce document CORRIGE explicitement l affirmation '
  'inverse, il faudrait le reecrire et non le laisser tel quel')
g(PG_BYPASS is True,
  'postgres n a plus BYPASSRLS : la seconde raison independante avancee par ce document '
  'tombe')
g(EXEMPTION_PROPRIETAIRE,
  'l exemption du proprietaire ne s applique plus')
g(ROLES['anon'][1] is False and ROLES['authenticated'][1] is False,
  'anon ou authenticated porte desormais BYPASSRLS : la RLS ne les filtrerait plus, et la '
  'prevision de lecture a zero ligne de ce document tombe')
g(AGE_DES_LIGNES_MESURE is None,
  'le comptage par age serait revenu : ce document dit qu il MANQUE, il faudrait l ecrire '
  'au lieu de continuer a annoncer une mesure absente')

# ── L'ETAT DU DEPOT QUE CE DOCUMENT SUPPOSE ────────────────────────────────────────────
g(re.match(r'^ft-v\d+$', VERSION or ''), 'la version servie n a pas pu etre lue dans sw.js')
g('p_email: email' in SB,
  'le client n envoie plus un p_email libre : ce document decrit V2 comme confirmee')
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


def ON(b):
    return '<b>oui</b>' if b else 'non'


OUI, NON, PART = '<b>OUI</b>', '<b>NON</b>', '<b>PARTIEL</b>'

H = []
H.append(P('Etape D - GRANTS, roles et EXECUTE, resultat reel', 'titre'))
H.append(P('Force Tracker - chantier S2-A2 (Supabase) - 16 septembre 2026 - base servie '
           + VERSION + ' - hors depot (regle d or #14) - lecture seule, aucune mutation',
           'sous'))

H.append(encadre(
    'CE QUE D TRANCHE, EN TROIS LIGNES',
    '&gt;&gt; <b>1)</b> ' + (C % 'anon') + ' <b>peut executer</b> ' + (C % 'ft_miroir')
    + ' : V2 est confirmee a une couche de plus.<br/>'
    '&gt;&gt; <b>2)</b> la porte laterale d ecriture directe est <b>fermee</b> : ni '
    + (C % 'anon') + ' ni ' + (C % 'authenticated') + ' n ont INSERT ou UPDATE, donc les '
    'policies de l etape C sont <b>inoperantes</b>.<br/>'
    '&gt;&gt; <b>3)</b> mais ils ont <b>SELECT</b>, <b>DELETE</b> et <b>TRUNCATE</b> - et '
    'c est le point neuf de cette etape.'))

# ── 1. CE QUI MANQUE DANS LE RESULTAT ──────────────────────────────────────────────────
H.append(encadre(
    'AVANT TOUT : UN BLOC DE LA REQUETE N EST PAS REVENU',
    'La requete envoyee portait un bloc ' + (C % 'age_des_lignes') + ' qui devait compter, '
    'en meme temps, les lignes tombant dans la fenetre du jeton. <b>Il est absent du '
    'resultat</b> : c est la version precedente de la requete qui a tourne. '
    '&gt;&gt; <b>Aucune conclusion de ce dossier n en depend</b>, et la mesure reste a '
    'prendre. <i>Elle est notee ici plutot que passee sous silence : une mesure annoncee '
    'et jamais faite finit par etre reputee faite.</i>', ORANGE))

H.append(P('2. Le resultat brut', 'h1'))
H.append(bloc_code(
    'TABLE public.%s\n'
    '  proprietaire      : %s\n'
    '  rls_activee       : %s\n'
    '  force_rls         : %s\n'
    '  acl               : %s\n\n'
    'FONCTION public.%s(%s)\n'
    '  proprietaire      : %s\n'
    '  security_definer  : %s\n'
    '  acl               : %s'
    % (TABLE['nom'], TABLE['proprietaire'], str(TABLE['rls_activee']).lower(),
       str(TABLE['force_rls']).lower(), TABLE['acl_texte'],
       FONCTION['nom'], FONCTION['arguments'], FONCTION['proprietaire'],
       str(FONCTION['security_definer']).lower(), FONCTION['acl_texte'])))

# ── 3. LES ROLES ───────────────────────────────────────────────────────────────────────
H.append(P('3. Les roles - et la correction que je dois a ce dossier', 'h1'))
H.append(tableau(
    ['role', 'superuser', 'bypassrls', 'inherit', 'canlogin', 'lecture'],
    [[C % r, ON(v[0]), ON(v[1]), ON(v[2]), ON(v[3]),
      {'anon': 'le role du navigateur : <b>soumis a la RLS</b>',
       'authenticated': 'meme profil que ' + (C % 'anon'),
       'postgres': '&gt;&gt; <b>pas superutilisateur</b>, mais <b>contourne la RLS</b>',
       'service_role': 'contourne la RLS - c est sa raison d etre, cote serveur'}[r]]
     for r, v in sorted(ROLES.items())],
    [30 * mm, 19 * mm, 19 * mm, 16 * mm, 17 * mm, 65 * mm]))
H.append(encadre(
    'JE ME SUIS TROMPE DANS LES DOSSIERS A ET C, ET LA MESURE LE DIT',
    'J y ai ecrit que ' + (C % 'ft_miroir') + ' « s execute en superutilisateur ». '
    '&gt;&gt; <b>' + (C % 'rolsuper') + ' vaut ' + str(PG_SUPER).lower() + '</b>. Chez '
    'Supabase, ' + (C % 'postgres') + ' est un role <b>gere</b>, pas un superutilisateur. '
    '<b>La conclusion tenait</b> - la RLS est bien contournee - <b>mais pour une raison que '
    'je n avais pas mesuree</b> : ' + (C % 'rolbypassrls') + '. <i>Une conclusion juste '
    'tiree d une premisse fausse reste une premisse fausse : elle se casse au premier '
    'endroit ou on s appuie dessus.</i> C etait exactement pour ca qu il fallait mesurer.'))

# ── 4. LES PRIVILEGES ──────────────────────────────────────────────────────────────────
H.append(P('4. Les privileges sur la table - deux mesures qui doivent coincider', 'h1'))
H.append(tableau(
    ['role', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'lettres de l ACL'],
    [[C % r, ON(PRIVS[r]['select']), ON(PRIVS[r]['insert']), ON(PRIVS[r]['update']),
      ON(PRIVS[r]['delete']), ON('truncate' in ACL[r]),
      C % TABLE['acl_texte'].strip('{}').split(',')[
          [x.split('=')[0] for x in TABLE['acl_texte'].strip('{}').split(',')].index(r)]]
     for r in sorted(PRIVS)],
    [28 * mm, 17 * mm, 17 * mm, 17 * mm, 17 * mm, 19 * mm, 51 * mm]))
H.append(P('Les deux colonnes viennent de <b>deux mesures independantes</b> : '
           + (C % 'has_table_privilege()') + ' d un cote, l ACL en toutes lettres de l '
           'autre. Un garde les <b>decode et les compare une par une</b> ; si elles se '
           'contredisaient, ce dossier refuserait de s imprimer. <i>Elles coincident.</i>',
           'petit'))
H.append(P('&gt;&gt; <b>La forme de ces droits est frappante</b> : ' + (C % 'anon')
           + ' recoit tout <b>sauf</b> INSERT et UPDATE. Ce n est le resultat d aucun '
           'reglage par defaut - il faut avoir retire ces deux-la <b>exactement</b>. '
           '<i>Qui l a fait et quand n est pas mesurable d ici</i> : ce serait dans le '
           'journal d activite du tableau de bord.', 'p'))

# ── 5. LA CHAINE ───────────────────────────────────────────────────────────────────────
H.append(P('5. Pourquoi ' + (C % 'ft_miroir') + ' ecrit malgre la RLS - la chaine reelle',
           'h1'))
H.append(tableau(
    ['maillon', 'mesure', 'consequence'],
    [['1. la fonction est ' + (C % 'SECURITY DEFINER'),
      C % str(FONCTION['security_definer']).lower(),
      'son corps s execute avec les droits de <b>son proprietaire</b>, pas de l appelant'],
     ['2. proprietaire de la fonction', C % FONCTION['proprietaire'],
      'le corps s execute donc comme ' + (C % 'postgres')],
     ['3. proprietaire de la table', C % TABLE['proprietaire'],
      '&gt;&gt; <b>c est le meme role</b>'],
     ['4. ' + (C % 'relforcerowsecurity'), C % str(TABLE['force_rls']).lower(),
      '&gt;&gt; le proprietaire d une table <b>n est pas soumis a sa RLS</b> tant que FORCE '
      'n est pas actif. <b>Premiere raison, suffisante a elle seule.</b>'],
     ['5. ' + (C % 'rolbypassrls') + ' de ' + (C % 'postgres'), C % str(PG_BYPASS).lower(),
      '&gt;&gt; il contourne la RLS de <b>toutes</b> les tables. <b>Seconde raison, '
      'suffisante a elle seule.</b>'],
     ['6. ' + (C % 'rolsuper') + ' de ' + (C % 'postgres'), C % str(PG_SUPER).lower(),
      '<b>ce n est PAS un superutilisateur</b> - ce n est donc pas l explication, contrairement '
      'a ce que j avais ecrit']],
    [46 * mm, 26 * mm, 94 * mm]))
H.append(P('&gt;&gt; <b>Plus de « probablement ».</b> Deux raisons independantes, chacune '
           'mesuree, chacune suffisante. <i>Et une consequence pour l etape C : la question '
           'que j y laissais ouverte est tranchee - <b>ces policies ne servent PAS au '
           'miroir</b>, puisque le proprietaire n est pas soumis a la RLS. Les retirer ne '
           'casserait aucune sauvegarde.</i>', 'p'))

# ── 6. V2 ──────────────────────────────────────────────────────────────────────────────
H.append(P('6. V2 apres D - confirmee a une couche de plus', 'h1'))
H.append(tableau(
    ['couche', 'etape', 'etat'],
    [['le SQL de la fonction accepte un e-mail libre', 'A', '<b>confirme</b>'],
     ['le role du navigateur a le droit de l appeler', '<b>D</b>',
      '<b>confirme</b> - ' + (C % 'anon') + ' : ' + ON(FONCTION['execute']['anon'])],
     ['l appel reussit reellement depuis Internet', 'F', 'non mesure']],
    [86 * mm, 20 * mm, 60 * mm]))
H.append(P('Le droit ' + (C % 'EXECUTE') + ' est donne <b>role par role</b> ('
           + ', '.join(C % r for r in FONCTION['beneficiaires']) + '), par '
           + (C % FONCTION['donneur']) + ', et <b>' + (C % 'PUBLIC') + ' n y figure pas</b>. '
           '&gt;&gt; C est une bonne nouvelle pour la suite : <i>un retrait cible est '
           'possible sans toucher aux autres roles</i>. C etait la question posee pour '
           'preparer S2-B.', 'p'))
H.append(P('<i>Note de methode : ' + (C % 'anon EXECUTE = true') + ' avait ete annonce '
           '<b>avant</b> la mesure, comme prediction falsifiable - le miroir ecrit '
           'reellement depuis un navigateur qui ne porte que la cle publique. La mesure la '
           'confirme. Si elle avait dit non, c est mon modele du systeme qui aurait ete '
           'faux.</i>', 'petit'))

# ── 7. LE POINT NEUF ───────────────────────────────────────────────────────────────────
H.append(P('7. Le point neuf, et il n etait pas au programme', 'h1'))
H.append(encadre(
    'ANON PORTE SELECT, DELETE ET TRUNCATE SUR LA TABLE',
    'Aucun des trois n est aujourd hui exploitable, et il faut dire <b>pourquoi</b>, parce '
    'que ce n est pas la meme raison :<br/>'
    '&gt;&gt; <b>SELECT</b> : le privilege existe, mais il n y a <b>aucune policy '
    'SELECT</b> (etape C) et ' + (C % 'anon') + ' n a pas ' + (C % 'BYPASSRLS')
    + '. Une lecture directe devrait donc rendre <b>zero ligne</b> - pas une erreur. '
    '<i>C est une attente, pas une mesure : seule l etape E la verifie.</i><br/>'
    '&gt;&gt; <b>DELETE</b> : meme mecanique, aucune policy DELETE. Une suppression '
    'porterait sur zero ligne. <b>Mais la seule chose qui protege les '
    + str(LIGNES) + ' sauvegardes est l ABSENCE d une policy</b> - ajouter un jour une '
    'policy ' + (C % 'FOR ALL') + ' par commodite les exposerait toutes, d un coup.<br/>'
    '&gt;&gt; <b>TRUNCATE</b> : et celui-la est different des deux autres. <b>La RLS ne '
    's applique pas a TRUNCATE</b> - aucune policy ne le filtre, jamais. Ce qui le rend '
    'inoffensif ici est autre chose : <i>l API REST n expose pas TRUNCATE</i>. '
    '&gt;&gt; <b>Sa seule protection est donc qu aucun chemin connu n y mene</b>, pas un '
    'verrou. C est exactement le genre de droit a retirer en S2-B.'))

# ── 8. LES REPONSES ────────────────────────────────────────────────────────────────────
H.append(P('8. Les reponses', 'h1'))
QD = [['D-Q1', (C % 'anon') + ' a SELECT ?', OUI, C % 'r dans rdDxtm, et has_table_privilege'],
      ['D-Q2', (C % 'authenticated') + ' a SELECT ?', OUI, 'meme ACL que ' + (C % 'anon')],
      ['D-Q3', (C % 'anon') + ' a INSERT ?', NON, 'le ' + (C % 'a') + ' est absent'],
      ['D-Q4', (C % 'anon') + ' a UPDATE ?', NON, 'le ' + (C % 'w') + ' est absent'],
      ['D-Q5', (C % 'authenticated') + ' a INSERT / UPDATE ?', NON, 'ni l un ni l autre'],
      ['D-Q6', (C % 'anon') + ' peut EXECUTE ' + (C % 'ft_miroir') + ' ?', OUI,
       C % 'anon=X/postgres'],
      ['D-Q7', (C % 'authenticated') + ' le peut ?', OUI, C % 'authenticated=X/postgres'],
      ['D-Q8', 'EXECUTE vient du role ou de ' + (C % 'PUBLIC') + ' ?',
       '<b>du role</b>', '&gt;&gt; les 4 roles sont <b>nommes</b> ; ' + (C % 'PUBLIC')
       + ' n apparait pas. Un retrait cible est donc possible'],
      ['D-Q9', 'qui possede ' + (C % 'ft_comptes') + ' ?',
       '<b>' + (C % TABLE['proprietaire']) + '</b>', 'le meme role que la fonction'],
      ['D-Q10', C % 'FORCE ROW LEVEL SECURITY' + ' actif ?', NON,
       C % 'relforcerowsecurity = false'],
      ['D-Q11', C % 'postgres' + ' est-il ' + (C % 'rolsuper') + ' ?', NON,
       '&gt;&gt; <b>false</b> - correction de mes dossiers A et C'],
      ['D-Q12', C % 'postgres' + ' est-il ' + (C % 'rolbypassrls') + ' ?', OUI,
       'c est la vraie raison du contournement'],
      ['D-Q13', 'peut-on expliquer precisement l ecriture malgre la RLS ?', OUI,
       'chaine en 6 maillons, section 5, deux raisons independantes'],
      ['D-Q14', 'porte laterale INSERT / UPDATE au niveau SQL ?', NON,
       '&gt;&gt; le privilege manque, donc les policies ' + (C % 'PUBLIC + true')
       + ' de l etape C sont <b>inoperantes</b>. <i>Mais voir 7 : DELETE et TRUNCATE, eux, '
       'sont bien la</i>'],
      ['D-Q15', 'la cle publique peut-elle LIRE les blobs ?', NON,
       'pas a partir de D. Le privilege existe, la RLS devrait tout filtrer - <b>l etape E '
       'tranche</b>'],
      ['D-Q16', 'peut-on decider purge / rotation ?', NON,
       'il manque la verification reelle de lecture publique']]
H.append(tableau(['#', 'question', 'reponse', 'la preuve'], QD,
                 [13 * mm, 52 * mm, 20 * mm, 81 * mm]))

# ── 9. BILAN ───────────────────────────────────────────────────────────────────────────
H.append(P('9. Ce qu on sait maintenant, et ce qu on ignore encore', 'h1'))
H.append(tableau(
    ['on le sait, et c est mesure', 'on l ignore encore'],
    [['V2 est confirmee a deux couches : le SQL et le droit d appeler',
      'si une lecture directe rend vraiment <b>zero ligne</b> (E)'],
     ['aucune ecriture directe possible pour ' + (C % 'anon') + ' : le privilege manque',
      'combien de lignes tombent dans la fenetre du jeton - <b>bloc non revenu</b>'],
     ['la chaine du contournement est etablie, sans « probablement »',
      'qui a retire INSERT et UPDATE a ' + (C % 'anon') + ', et quand'],
     ['les policies de C ne servent pas au miroir : elles peuvent partir',
      'si un autre chemin (vue, autre fonction) expose la table'],
     ['le droit EXECUTE est nomme role par role : un retrait cible est possible',
      'si ' + (C % 'TRUNCATE') + ' est atteignable par un chemin non identifie']],
    [82 * mm, 84 * mm]))

H.append(P('<b>Prochaine etape proposee : E uniquement</b> - verifier reellement, avec la '
           'cle publique, ce que rend une lecture de ' + (C % 'ft_comptes') + '. <i>C est '
           'la seule mesure qui manque encore pour decider de la purge</i>, et ce n est '
           'plus du SQL.', 'p'))
H.append(P('Mesure faite par Michel dans le tableau de bord Supabase, depuis son telephone. '
           'Lecture seule : la requete ne contenait que des ' + (C % 'select') + ' sur les '
           'catalogues.', 'petit'))

# ── [!!] GARDES DE FIN ─────────────────────────────────────────────────────────────────
TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()

INTERDITS = [
    (r'la cle publique peut lire|peut lire les sauvegardes|peut lire les blobs',
     'le document AFFIRME que la cle publique peut lire : D ne mesure que le privilege, '
     'pas le comportement reel - c est l etape E'),
    (r'exploitable depuis internet|n importe qui peut ecrire',
     'le document AFFIRME une exploitation reelle : le test de bout en bout est l etape F'),
    (r'aucune purge n est necessaire|purge terminee',
     'le document AFFIRME qu aucune purge n est necessaire'),
    (r'postgres est superutilisateur|s execute en superutilisateur',
     'le document AFFIRME que postgres est superutilisateur : la mesure dit rolsuper = false, '
     'et ce dossier existe en partie pour corriger cette phrase'),
]


def _mentionnee(txt, i):
    ouvre = txt.rfind('«', 0, i)
    if ouvre < 0:
        return False
    return txt.find('»', ouvre) > i


# [!!] LE SAUT DE LIGNE EST UNE FIN DE PHRASE, ET L OUBLIER REND LE GARDE AVEUGLE.
# Trouve par le controle negatif : dans un encadre sans point final, la fenetre remontait
# jusqu au debut du bloc et y trouvait la negation d une clause SANS RAPPORT
# (« aucun des trois n est exploitable »), ce qui laissait passer une affirmation posee
# trois lignes plus bas. Un <br/> separe deux affirmations independantes : il coupe.
for _bloc in TEXTES:
    _b = _bloc.lower()
    for _mot, _msg in INTERDITS:
        for m in re.finditer(_mot, _b):
            deb = max([_b.rfind(c, 0, m.start()) for c in '.?!']
                      + [_b.rfind('<br/>', 0, m.start()) + 4]) + 1
            fin = min([i for i in (_b.find(c, m.end()) for c in '.?!') if i != -1]
                      or [len(_b)])
            interrogative = _b[deb:fin + 1].rstrip().endswith('?')
            citee = _mentionnee(_b, m.start())
            niee = re.search(r"\bne\b|\bn\b|\bpas\b|\bjamais\b|\bni\b|\bnon\b|\bsi\b",
                             _b[deb:m.start()])
            g(interrogative or citee or niee is not None, _msg)

for _q, _att in (('D-Q15', NON), ('D-Q16', NON), ('D-Q14', NON), ('D-Q6', OUI),
                 ('D-Q10', NON), ('D-Q11', NON), ('D-Q12', OUI), ('D-Q1', OUI),
                 ('D-Q3', NON), ('D-Q4', NON)):
    _l = [r for r in QD if r[0] == _q]
    g(len(_l) == 1 and _l[0][2] == _att,
      'la question %s ne repond plus %s : ce document conclurait autrement que ce qu il a '
      'mesure' % (_q, re.sub('<[^>]+>', '', _att)))

g('truncate' in _bt,
  'le document ne parle plus de TRUNCATE : c est le seul des trois droits que la RLS ne '
  'filtre PAS, donc le plus important a signaler')
g('rolbypassrls' in _bt,
  'le document ne nomme plus rolbypassrls : c est la vraie raison du contournement')
g('rolsuper' in _bt,
  'le document ne nomme plus rolsuper : c est la mesure qui corrige mes dossiers A et C')
g('inoperant' in _bt,
  'le document ne dit plus que les policies de C sont inoperantes : c est ce qui repond a '
  'D-Q14')
g('age_des_lignes' in _bt,
  'le document ne signale plus le bloc de requete qui n est pas revenu : une mesure '
  'annoncee et jamais faite finit par etre reputee faite')
g('etape e' in _bt or 'l etape e' in _bt,
  'le document ne renvoie plus a l etape E : c est la seule mesure qui manque pour decider')

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Etape D - grants, roles et EXECUTE',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, anon SELECT=%s INSERT=%s UPDATE=%s EXECUTE=%s, force_rls=%s, '
      'postgres super=%s bypassrls=%s)'
      % (OUT, VERSION, GARDES[0], ANON_SELECT, ANON_INSERT, ANON_UPDATE,
         FONCTION['execute']['anon'], TABLE['force_rls'], PG_SUPER, PG_BYPASS))
