#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER GPT — S2-A2 : audit Supabase de bout en bout (etapes A a D). Hors depot.

[!!] CE DOCUMENT EST ECRIT POUR ETRE LU SANS LE DEPOT (GPT, Gemini, une autre instance).
     Il doit donc porter son propre contexte : ce qu'est Force Tracker, pourquoi Supabase
     existe, ce que les deux correctifs de la journee ont change, puis les quatre mesures.

[!!] SES GARDES FONT DEUX CHOSES DIFFERENTES, ET C'EST VOULU :
     - ce qui vit DANS LE DEPOT est recompte depuis le code servi (version, le fait que le
       client n'appelle qu'une RPC, l'absence de cle service_role, le commentaire du
       05/08) — si le code bouge, le dossier refuse de sortir ;
     - ce qui vient DU TABLEAU DE BORD est recoupe avec lui-meme (l'ACL en lettres contre
       has_table_privilege, 8+2=10, proprietaire table == proprietaire fonction).

[!!] LES REFUS DE CONCLURE, identiques a ceux des dossiers d'etape : « anon a le privilege
     SELECT » ne devient jamais « la cle publique peut lire » ; « 8 lignes non reecrites »
     ne devient jamais « 8 blobs portent un jeton » ; la decision purge/rotation reste NON.

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
    SCRATCH, 'DOSSIER-GPT-S2A2-AUDIT-SUPABASE-A-D-16-09-2026.pdf')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires(src):
    """Retire les commentaires, GARDE les chaines."""
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
SETUP = sans_commentaires(lire('setup.js'))
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]

# ═══════════════════════════════════════════════════════════════════════════════════════
# CE QUI VIT DANS LE DEPOT — recompte depuis le code servi
# ═══════════════════════════════════════════════════════════════════════════════════════
g(re.match(r'^ft-v\d+$', VERSION or ''), 'la version servie n a pas pu etre lue dans sw.js')
# le client n'appelle QUE la RPC : aucune ecriture ni lecture directe de la table
APPELS_RPC = len(re.findall(r"/rest/v1/rpc/", SB))
APPELS_TABLE = len(re.findall(r"/rest/v1/(?!rpc/)", SB))
g(APPELS_RPC >= 1 and APPELS_TABLE == 0,
  'le client touche desormais la table en direct (%d appels) : ce dossier affirme qu il ne '
  'passe QUE par la RPC (%d appels)' % (APPELS_TABLE, APPELS_RPC))
# aucune cle privilegiee dans le code servi
for _f in ('supabase.js', 'app.js', 'constants.js', 'index.html', 'sw.js'):
    _src = sans_commentaires(lire(_f))
    g('service_role' not in _src,
      'une cle service_role apparait dans %s : ce dossier affirme que le client n en porte '
      'aucune' % _f)
g('p_email: email' in SB,
  'le client n envoie plus un p_email libre : ce dossier decrit V2 comme ouverte')
g('function _sbSansJustificatifs(' in SB,
  'le filet de S2-A a disparu : ce dossier decrit la fuite future comme fermee')
def corps_fonction(src, entete):
    """Corps d'une fonction, par equilibrage d'accolades en ignorant les chaines.
    [!!] L'invariant de S2-A est BORNE A _cloudSync : compter dans tout le fichier
    rougirait sur _authCode() employe par la restauration, qui est un usage legitime.
    Un garde plus large que la contrainte reelle refuse du travail juste."""
    i = src.index(entete)
    j = src.index('{', i)
    prof, k, n = 0, j, len(src)
    while k < n:
        c = src[k]
        if c in '\'"`':
            q, k = c, k + 1
            while k < n and src[k] != q:
                k += 2 if src[k] == '\\' else 1
        elif c == '{':
            prof += 1
        elif c == '}':
            prof -= 1
            if prof == 0:
                return src[j:k + 1]
        k += 1
    raise SystemExit('GARDE ROUGE - corps de %s introuvable' % entete)


CS = corps_fonction(SETUP, 'function _cloudSync(')
g(CS.count('_ftToken()') == 1 and CS.count('_authCode()') == 1,
  'un justificatif est lu %d/%d fois dans _cloudSync : l invariant pose par S2-A (exactement '
  'une lecture chacun, quel que soit le deguisement - alias, copie, detour) ne tient plus'
  % (CS.count('_ftToken()'), CS.count('_authCode()')))
g('sbMirror(_corpsSync)' in CS,
  'le miroir ne recoit plus le corps metier prive des justificatifs : la correction S2-A '
  'decrite par ce dossier ne serait plus celle du code')
# le commentaire du 05/08 est une PIECE du dossier : il doit etre la, dans les commentaires
COMMENTAIRE_0508 = "ON N'ÉCRIT PAS DANS LA TABLE, ON APPELLE UNE FONCTION (05/08/2026)"
g(COMMENTAIRE_0508 in SB_BRUT,
  'le commentaire du 05/08 a disparu de supabase.js : la section 8 de ce dossier le cite '
  'et en discute le diagnostic')
g('La lecture reste évidemment impossible' in SB_BRUT,
  'la phrase « la lecture reste evidemment impossible » a disparu : c est precisement '
  'l affirmation que ce dossier confronte a la mesure')
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
# CE QUI VIENT DU TABLEAU DE BORD — recoupe avec lui-meme
# ═══════════════════════════════════════════════════════════════════════════════════════
SQL_MIROIR = """CREATE OR REPLACE FUNCTION public.ft_miroir(p_email text, p_data jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.ft_comptes(email, data, updated_at)
  values (lower(trim(p_email)), p_data, now())
  on conflict (email) do update
    set data = excluded.data, updated_at = now();
end;
$function$"""
TABLE = {'nom': 'ft_comptes', 'proprietaire': 'postgres', 'rls_activee': True,
         'force_rls': False, 'taille': '728 kB', 'lignes': 10, 'distincts': 10,
         'non_normalises': 0, 'updated_at_null': 0,
         'plus_ancienne': '2026-08-05T20:15:23+00:00',
         'plus_recente': '2026-09-16T15:51:54+00:00',
         'pk': 'ft_comptes_pkey / email',
         'acl_texte': '{postgres=arwdDxtm/postgres,anon=rdDxtm/postgres,'
                      'authenticated=rdDxtm/postgres,service_role=arwdDxtm/postgres}'}
COMPTAGE = {'anciennes': 8, 'recentes': 2}
POLICIES = [('ft_comptes_insert', 'PERMISSIVE', '{public}', 'INSERT', None, 'true'),
            ('ft_comptes_update', 'PERMISSIVE', '{public}', 'UPDATE', 'true', 'true')]
ROLES = {'anon': (False, False), 'authenticated': (False, False),
         'postgres': (False, True), 'service_role': (False, True)}   # (rolsuper, bypassrls)
PRIVS = {'anon':          {'select': True, 'insert': False, 'update': False, 'delete': True},
         'authenticated': {'select': True, 'insert': False, 'update': False, 'delete': True},
         'postgres':      {'select': True, 'insert': True,  'update': True,  'delete': True},
         'service_role':  {'select': True, 'insert': True,  'update': True,  'delete': True}}
EXECUTE_FN = {'anon': True, 'authenticated': True, 'service_role': True, 'postgres': True}
BENEF_FN = ['postgres', 'anon', 'authenticated', 'service_role']
DEPLOIEMENTS = {'ft-v1216': ('2026-09-16T08:38:19+00:00', 1175),
                'ft-v1217': ('2026-09-16T10:07:19+00:00', 1178)}
NAISSANCE_MIROIR = '2026-08-04'

ACL_LETTRES = {'a': 'insert', 'r': 'select', 'w': 'update', 'd': 'delete',
               'D': 'truncate', 'x': 'references', 't': 'trigger', 'm': 'maintain'}


def decoder_acl(txt):
    out = {}
    for item in txt.strip('{}').split(','):
        cible, _, reste = item.partition('=')
        lettres, _, _d = reste.partition('/')
        out[cible or 'PUBLIC'] = {ACL_LETTRES[l] for l in lettres if l in ACL_LETTRES}
    return out


ACL = decoder_acl(TABLE['acl_texte'])
g(set(ACL) == set(PRIVS), 'les deux mesures de privileges ne portent pas sur les memes roles')
for _r, _p in PRIVS.items():
    for _priv, _att in _p.items():
        g((_priv in ACL[_r]) == _att,
          'CONTRADICTION DANS LA MESURE : has_table_privilege dit %s=%s pour %s, l ACL en '
          'lettres dit le contraire' % (_priv, _att, _r))
g(COMPTAGE['anciennes'] + COMPTAGE['recentes'] == TABLE['lignes'],
  'le comptage par age ne retombe pas sur le total')
g(TABLE['distincts'] == TABLE['lignes'] and TABLE['non_normalises'] == 0,
  'la mesure ne dit plus « une ligne par compte, aucune variante de casse »')
g('on conflict (email) do update' in SQL_MIROIR.lower()
  and 'set data = excluded.data' in SQL_MIROIR.lower(),
  'le SQL cite ne fait plus un UPSERT a remplacement complet')
for _f in ('||', 'jsonb_set', 'coalesce'):
    g(_f not in SQL_MIROIR.lower(),
      'le SQL cite contient « %s » : il y aurait fusion, et une sauvegarde propre '
      'n effacerait PAS l ancien justificatif' % _f)
g('security definer' in SQL_MIROIR.lower(), 'le SQL cite n est plus SECURITY DEFINER')
CMDS = {p[3] for p in POLICIES}
g('SELECT' not in CMDS and 'DELETE' not in CMDS and 'ALL' not in CMDS,
  'une policy de lecture ou de suppression est apparue : tout le raisonnement de ce dossier '
  'sur la lecture tombe')
EXPRS = [e for p in POLICIES for e in (p[4], p[5]) if e]
g(all(e.strip().lower() == 'true' for e in EXPRS),
  'les policies ne sont plus inconditionnelles')
g(TABLE['force_rls'] is False and TABLE['proprietaire'] == 'postgres',
  'l exemption du proprietaire ne s applique plus : la chaine expliquee ici tombe')
g(ROLES['postgres'] == (False, True),
  'les attributs de postgres ont change : ce dossier insiste sur rolsuper=false et '
  'rolbypassrls=true')
g(ROLES['anon'][1] is False,
  'anon porte desormais BYPASSRLS : la RLS ne le filtrerait plus')
g(EXECUTE_FN['anon'] is True, 'anon ne peut plus executer ft_miroir')
g('PUBLIC' not in BENEF_FN,
  'PUBLIC apparait dans l ACL de la fonction : un retrait cible ne serait plus possible')
PORTE_LATERALE = any(PRIVS[r]['insert'] or PRIVS[r]['update']
                     for r in ('anon', 'authenticated'))
g(not PORTE_LATERALE, 'une porte laterale d ecriture directe existe desormais')
_T = {k: v[0] for k, v in DEPLOIEMENTS.items()}
g(_T['ft-v1216'] < _T['ft-v1217'], 'les deux deploiements sont dans le mauvais ordre')

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
                           fontSize=6.9, leading=8.8, textColor=ENCRE, spaceAfter=2),
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


def ON(b):
    return '<b>oui</b>' if b else 'non'


H = []
H.append(P('S2-A2 - audit Supabase de Force Tracker, etapes A a D', 'titre'))
H.append(P('Dossier autonome - 16 septembre 2026 - base servie ' + VERSION
           + ' - lisible sans le depot - aucune mutation n a ete faite sur la base',
           'sous'))

# ── 0. CONTEXTE ────────────────────────────────────────────────────────────────────────
H.append(P('0. De quoi on parle (contexte pour un lecteur exterieur)', 'h1'))
H.append(P('<b>Force Tracker</b> est une application web de suivi de musculation, ecrite en '
           'JavaScript sans framework, servie par GitHub Pages. Tout vit d abord <b>en '
           'local</b> dans le navigateur ; le reseau ne doit jamais bloquer ni faire perdre '
           'une seance. Trois services distants existent derriere : un <b>Apps Script</b> '
           'Google (sauvegarde de reference, quotas, premium), un <b>Worker Cloudflare</b> '
           '(les appels au modele de langage) et, depuis le ' + NAISSANCE_MIROIR + ', un '
           '<b>miroir Supabase</b> - une copie de secours de la sauvegarde, en ecriture '
           'seule.', 'p'))
H.append(P('Le miroir fonctionne ainsi : a chaque sauvegarde, le navigateur appelle une '
           'fonction PostgreSQL ' + (C % 'ft_miroir(p_email, p_data)') + ' via l API REST '
           'de Supabase, en portant la <b>cle publique</b> de l application (celle qui est '
           'dans le code, visible de tous - c est sa nature). La question de cet audit est '
           'simple : <b>qu est-ce que cette cle permet vraiment ?</b>', 'p'))

H.append(encadre(
    'LES DEUX CORRECTIFS DEJA LIVRES AUJOURD HUI, QUI EXPLIQUENT POURQUOI ON AUDITE',
    '&gt;&gt; <b>' + (C % 'ft-v1216') + ' (S1)</b>, en ligne a '
    + (C % DEPLOIEMENTS['ft-v1216'][0][:19]) + ' : l identite cesse d etre une adresse '
    'e-mail declaree. Un registre de jetons cote serveur remplace « l e-mail du message vaut '
    'identite ».<br/>'
    '&gt;&gt; <b>' + (C % 'ft-v1217') + ' (S2-A)</b>, en ligne a '
    + (C % DEPLOIEMENTS['ft-v1217'][0][:19]) + ' : on a decouvert que le corps de '
    'sauvegarde - construit <b>une fois</b> et servi aux <b>deux</b> destinations - portait '
    'le jeton S1 <b>brut</b> et le code perso <b>en clair</b> jusque dans Supabase. Corrige : '
    'les justificatifs ne voyagent plus que sur le transport qui en a besoin.<br/>'
    '&gt;&gt; <b>Ce que ces correctifs ne font PAS</b> : les lignes <b>deja ecrites</b> dans '
    'Supabase ne sont pas purgees. D ou cet audit - pour savoir si elles sont lisibles par '
    'quelqu un.'))

# ── 1. A ───────────────────────────────────────────────────────────────────────────────
H.append(P('1. Etape A - la fonction ' + (C % 'ft_miroir'), 'h1'))
H.append(bloc_code(SQL_MIROIR))
H.append(P('Lecture : c est un <b>UPSERT</b> ('
           + (C % 'on conflict (email) do update') + ') qui <b>remplace la colonne '
           + (C % 'data') + ' en entier</b> (' + (C % 'set data = excluded.data') + '). '
           '&gt;&gt; <b>Aucune fusion JSON</b> - pas de ' + (C % '||') + ', pas de '
           + (C % 'jsonb_set') + ', pas de ' + (C % 'coalesce') + '. C etait le pire cas a '
           'ecarter : avec une fusion, une sauvegarde propre <b>n aurait pas efface</b> '
           'l ancien jeton, qui serait reste pour toujours.', 'p'))
H.append(P('&gt;&gt; <b>Et le point qui compte pour la securite</b> : '
           + (C % 'p_email') + ' <b>choisit directement la ligne ecrite</b>, et rien ne le '
           'compare a une identite - ni ' + (C % 'auth.uid()') + ', ni '
           + (C % 'current_user') + ', aucune verification. <i>C est ce que ce chantier '
           'appelle V2.</i>', 'p'))

# ── 2. B ───────────────────────────────────────────────────────────────────────────────
H.append(P('2. Etape B - la table ' + (C % 'public.ft_comptes'), 'h1'))
H.append(tableau(
    ['mesure', 'valeur', 'ce que ca ferme'],
    [['lignes (' + (C % 'count(*)') + ')', '<b>' + str(TABLE['lignes']) + '</b>',
      'la base est petite - l audit porte sur un objet reel, pas sur une hypothese'],
     ['e-mails normalises distincts', str(TABLE['distincts']),
      '&gt;&gt; egal au nombre de lignes'],
     ['e-mails non normalises', str(TABLE['non_normalises']),
      '&gt;&gt; <b>aucune variante de casse</b> a rattraper - le risque nomme avant la '
      'mesure n existe pas'],
     ['colonnes', C % 'email text / data jsonb / updated_at timestamptz',
      '&gt;&gt; <b>aucune colonne d historique</b> : il n existe pas de table ou les vieux '
      'blobs se seraient accumules'],
     ['cle primaire', C % TABLE['pk'],
      'l unicite passe de <b>deduite</b> (A) a <b>prouvee</b> (B)'],
     ['RLS activee', 'true', 'voir etapes C et D - seule, cette ligne ne dit rien'],
     ['taille', TABLE['taille'],
      'inclut index, stockage deporte et versions mortes : <b>ne pas diviser</b> par le '
      'nombre de lignes'],
     [(C % 'updated_at') + ' NULL', str(TABLE['updated_at_null']),
      'toute ligne est datable, donc le comptage par age porte sur la totalite']],
    [40 * mm, 46 * mm, 80 * mm]))

H.append(encadre(
    'LA FENETRE DU JETON - LE SEUL VRAI APPORT DE B',
    'Le jeton S1 n a existe dans une version servie qu entre '
    + (C % DEPLOIEMENTS['ft-v1216'][0][:19]) + ' et '
    + (C % DEPLOIEMENTS['ft-v1217'][0][:19]) + ', soit <b>1h29</b> (dates lues dans les '
    'deploiements GitHub Actions, runs #' + str(DEPLOIEMENTS['ft-v1216'][1]) + ' et #'
    + str(DEPLOIEMENTS['ft-v1217'][1]) + '). &gt;&gt; Une ligne anterieure a la premiere '
    'date <b>ne peut pas</b> porter de jeton : il n existait nulle part. <b>Borne basse '
    'dure.</b><br/>'
    '&gt;&gt; La borne haute est floue : l application est servie depuis un cache, donc un '
    'telephone a pu tourner sur l ancienne version apres la mise en ligne. <i>Une date de '
    'deploiement borne le code SERVI, pas le code EXECUTE.</i><br/>'
    '&gt;&gt; Comptage : <b>' + str(COMPTAGE['anciennes']) + ' lignes sur '
    + str(TABLE['lignes']) + '</b> n ont pas ete reecrites depuis le correctif. <b>Ce n est '
    'PAS « ' + str(COMPTAGE['anciennes']) + ' blobs portent un jeton »</b> : le code perso '
    'ne concerne que les comptes qui en ont pose un (il est optionnel), et le jeton que la '
    'fenetre de 1h29. <i>Combien de lignes tombent dans cette fenetre n a pas encore ete '
    'mesure.</i>', ORANGE))

H.append(PageBreak())

# ── 3. C ───────────────────────────────────────────────────────────────────────────────
H.append(P('3. Etape C - les policies RLS', 'h1'))
H.append(bloc_code(
    'policyname        | permissive | roles    | cmd    | qual | with_check\n'
    '------------------+------------+----------+--------+------+-----------\n'
    + '\n'.join('%-17s | %-10s | %-8s | %-6s | %-4s | %s'
                % (p[0], p[1], p[2], p[3], 'null' if p[4] is None else p[4], p[5])
                for p in POLICIES)))
H.append(P('Deux policies, toutes deux en <b>ecriture</b>, toutes deux sur '
           + (C % '{public}') + ', et les <b>' + str(len(EXPRS)) + ' expressions valent '
           + (C % 'true') + '</b>. &gt;&gt; <b>Aucune policy de lecture. Aucune policy de '
           'suppression. Aucune condition d identite nulle part</b> - pas de '
           + (C % 'auth.uid()') + ', pas de JWT, rien qui rattache une ligne a la personne '
           'qui la modifie.', 'p'))
H.append(P('&gt;&gt; Deux pieges de vocabulaire, qui changent la lecture : '
           + (C % 'public') + ' <b>n est pas un role</b> a cote de ' + (C % 'anon') + ' - '
           'c est le pseudo-role auquel <b>tout role appartient</b>, donc ces policies '
           'couvrent ' + (C % 'anon') + ' sans le nommer. Et une policy <b>ne donne aucun '
           'droit</b> : elle <b>filtre</b> ceux que les GRANT ont donnes. <i>D ou l etape '
           'D.</i>', 'p'))

# ── 4. D ───────────────────────────────────────────────────────────────────────────────
H.append(P('4. Etape D - les GRANT, les roles et ' + (C % 'EXECUTE'), 'h1'))
H.append(tableau(
    ['role', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE',
     C % 'EXECUTE ft_miroir', C % 'rolsuper', C % 'rolbypassrls'],
    [[C % r, ON(PRIVS[r]['select']), ON(PRIVS[r]['insert']), ON(PRIVS[r]['update']),
      ON(PRIVS[r]['delete']), ON('truncate' in ACL[r]), ON(EXECUTE_FN[r]),
      ON(ROLES[r][0]), ON(ROLES[r][1])] for r in sorted(PRIVS)],
    [26 * mm, 15 * mm, 15 * mm, 16 * mm, 16 * mm, 18 * mm, 24 * mm, 17 * mm, 19 * mm]))
H.append(P('ACL brute de la table : ' + (C % TABLE['acl_texte']) + '. Les deux colonnes '
           'viennent de <b>deux mesures independantes</b> (' + (C % 'has_table_privilege()')
           + ' et l ACL en lettres) ; un garde les decode et les compare une par une - si '
           'elles se contredisaient, ce dossier refuserait de s imprimer.', 'petit'))

H.append(P('<b>Pourquoi ' + (C % 'ft_miroir') + ' ecrit malgre la RLS - la chaine complete, '
           'chaque maillon mesure :</b> la fonction est ' + (C % 'SECURITY DEFINER')
           + ', donc son corps s execute comme son proprietaire ' + (C % 'postgres') + ' ; '
           'or ' + (C % 'postgres') + ' est <b>aussi</b> le proprietaire de la table, et '
           + (C % 'relforcerowsecurity') + ' vaut <b>false</b> - <b>le proprietaire n est '
           'donc pas soumis a la RLS de sa propre table</b> (premiere raison, suffisante). '
           'Et ' + (C % 'postgres') + ' porte ' + (C % 'rolbypassrls') + ' (seconde raison, '
           'suffisante). &gt;&gt; <b>En revanche ' + (C % 'rolsuper') + ' vaut false</b> : '
           'ce n est <b>pas</b> un superutilisateur, contrairement a ce que les premiers '
           'dossiers de ce chantier affirmaient. <i>Une conclusion juste tiree d une '
           'premisse fausse reste une premisse fausse.</i>', 'p'))

H.append(encadre(
    'LES TROIS RESULTATS DE D, DANS L ORDRE D IMPORTANCE',
    '&gt;&gt; <b>1) V2 est confirmee a une couche de plus</b> : ' + (C % 'anon')
    + ' <b>a le droit d executer</b> ' + (C % 'ft_miroir') + '. Le SQL accepte un e-mail '
    'libre (A), et le role du navigateur a le droit d appeler (D). Il ne manque que le test '
    'de bout en bout. <i>Concretement : quiconque dispose de la cle publique - c est-a-dire '
    'quiconque ouvre le code de la page - peut, en theorie, ecraser la sauvegarde de '
    'n importe quelle adresse e-mail qu il connait.</i><br/>'
    '&gt;&gt; <b>2) La porte laterale d ecriture directe est fermee</b> : ni '
    + (C % 'anon') + ' ni ' + (C % 'authenticated') + ' n ont INSERT ou UPDATE. Les deux '
    'policies de l etape C sont donc <b>inoperantes</b> - elles filtrent un droit qui n '
    'existe pas.<br/>'
    '&gt;&gt; <b>3) Mais ces roles portent SELECT, DELETE et TRUNCATE</b>, et les trois sont '
    'inoffensifs pour <b>trois raisons differentes</b> - detail en 6.'))

# ── 5. LE COMMENTAIRE DU 05/08 ─────────────────────────────────────────────────────────
H.append(P('5. Ce que le code disait deja - et ce que la mesure en fait', 'h1'))
H.append(P('Le depot porte, dans ' + (C % 'supabase.js') + ', un commentaire date du '
           '<b>05/08/2026</b> qui explique pourquoi on est passe de l ecriture directe a la '
           'fonction. Il repond a une question que l audit avait laissee ouverte - <i>qui a '
           'retire INSERT et UPDATE, et quand ?</i> - et il en ouvre une autre.', 'p'))
H.append(bloc_code(
    "ON N'ECRIT PAS DANS LA TABLE, ON APPELLE UNE FONCTION (05/08/2026).\n"
    "L'ecriture directe (/rest/v1/ft_comptes + resolution=merge-duplicates) etait\n"
    "refusee par le RLS malgre des policies INSERT/UPDATE en {public} avec\n"
    "WITH CHECK (true) - verifie dans pg_policies. [...]\n"
    "ET C'EST PLUS SUR : la cle publiee dans l'app n'a plus AUCUN droit sur la table\n"
    "(INSERT et UPDATE lui ont ete retires). [...] La lecture reste evidemment impossible."))
H.append(tableau(
    ['ce que le commentaire dit', 'ce que la mesure en dit'],
    [['les policies ' + (C % '{public}') + ' existaient deja',
      '<b>confirme</b> - ce sont les memes qu aujourd hui, et elles sont donc '
      '<b>vestigiales</b> : les restes d une approche abandonnee'],
     ['INSERT et UPDATE ont ete retires a la cle publique',
      '<b>confirme</b> - ' + (C % 'anon=rdDxtm') + ' : le ' + (C % 'a') + ' et le '
      + (C % 'w') + ' sont absents. <i>Le retrait etait delibere, pas accidentel</i>'],
     ['l ecriture directe « etait refusee par le RLS »',
      '&gt;&gt; <b>douteux.</b> Avec une policy PERMISSIVE en ' + (C % 'WITH CHECK (true)')
      + ', la RLS <b>autorise</b> l ecriture. La cause bien plus probable est le '
      '<b>privilege manquant</b>. Les deux erreurs partagent le meme code PostgreSQL '
      '(' + (C % '42501') + '), ce qui les rend faciles a confondre. <i>Non tranchable '
      'd ici : il faudrait l historique des GRANT.</i>'],
     ['« la cle publique n a plus AUCUN droit sur la table »',
      '&gt;&gt; <b>faux, mesure</b> : elle porte SELECT, DELETE, TRUNCATE, REFERENCES, '
      'TRIGGER et MAINTAIN. Elle n a plus de droit d <b>ecriture de lignes</b>, ce qui n est '
      'pas la meme chose'],
     ['« la lecture reste evidemment impossible »',
      '&gt;&gt; <b>l adverbe est de trop.</b> Le privilege SELECT <b>est accorde</b>. Ce qui '
      'bloque la lecture n est pas l absence de droit, c est l <b>absence de policy</b> - un '
      'mecanisme different, et qui n a jamais ete verifie']],
    [58 * mm, 108 * mm]))
H.append(P('&gt;&gt; <b>Ce n est pas un reproche, c est le point le plus instructif du '
           'dossier.</b> La decision prise le 05/08 etait <b>bonne</b> - passer par une '
           'fonction ' + (C % 'SECURITY DEFINER') + ' est plus sur. Mais elle a ete prise '
           'sur un diagnostic probablement faux, et accompagnee de deux affirmations de '
           'securite qui n avaient pas ete mesurees. <i>Une protection supposee ne se '
           'distingue d une protection reelle qu au moment ou on la mesure - et la plupart '
           'du temps, personne ne la mesure.</i>', 'p'))

# ── 6. LES TROIS DROITS ────────────────────────────────────────────────────────────────
H.append(P('6. ' + (C % 'anon') + ' porte SELECT, DELETE et TRUNCATE - trois protections '
           'differentes', 'h1'))
H.append(tableau(
    ['droit', 'ce qui l empeche aujourd hui', 'solidite'],
    [['<b>SELECT</b>', 'aucune policy SELECT, et ' + (C % 'anon') + ' n a pas '
      + (C % 'BYPASSRLS') + ' : la lecture devrait rendre <b>zero ligne</b> - pas une erreur',
      '<b>attendu, non mesure</b> - c est l etape E, et c est la seule mesure qui manque '
      'pour decider de la purge'],
     ['<b>DELETE</b>', 'aucune policy DELETE : la suppression porterait sur zero ligne',
      '&gt;&gt; <b>fragile</b> : la seule chose qui protege les ' + str(TABLE['lignes'])
      + ' sauvegardes est l <b>absence</b> d une policy. Ajouter un jour une policy '
      + (C % 'FOR ALL') + ' par commodite les exposerait toutes'],
     ['<b>TRUNCATE</b>', '&gt;&gt; <b>la RLS ne s applique pas a TRUNCATE</b> - aucune '
      'policy ne le filtre, jamais. Ce qui le rend inoffensif est que l API REST ne '
      'l expose pas',
      '&gt;&gt; <b>ce n est pas un verrou</b>, c est l absence d un chemin connu. A retirer'],
     ['<b>EXECUTE</b> sur ' + (C % 'ft_miroir'),
      'rien - c est le droit qui fait marcher le miroir',
      'accorde <b>role par role</b> (' + ', '.join(BENEF_FN) + '), '
      + (C % 'PUBLIC') + ' absent : <b>un retrait cible est possible</b>']],
    [30 * mm, 66 * mm, 70 * mm]))

# ── 7. ETAT / DECISIONS ────────────────────────────────────────────────────────────────
H.append(P('7. Ou en est le chantier, et ce qui attend une decision', 'h1'))
H.append(tableau(
    ['etabli, et mesure', 'encore ouvert'],
    [['la fuite <b>future</b> est fermee (ft-v1217) : les justificatifs ne partent plus',
      '<b>la lecture reelle</b> avec la cle publique - <b>etape E</b>, et c est le facteur '
      'decisif'],
     ['une seule ligne par compte, aucune variante de casse, aucun historique cache',
      'le test de bout en bout de V2 - <b>etape F</b>'],
     ['la fenetre du jeton est bornee a <b>1h29</b>, avec une borne basse dure',
      'combien des ' + str(COMPTAGE['anciennes']) + ' lignes tombent dans cette fenetre'],
     ['aucune ecriture directe possible pour la cle publique',
      '<b>purge</b> des ' + str(COMPTAGE['anciennes']) + ' lignes, ou attente qu elles se '
      'reecrivent seules'],
     ['la chaine du contournement de la RLS est etablie, sans « probablement »',
      '<b>rotation</b> du jeton S1 et des codes perso exposes'],
     ['aucune cle privilegiee dans le code servi ; le client n appelle qu une RPC',
      'fermeture de V2 - et <b>par quel chemin</b> (voir 8)']],
    [82 * mm, 84 * mm]))

# ── 8. QUESTIONS OUVERTES ──────────────────────────────────────────────────────────────
H.append(P('8. Quatre questions ouvertes - ce dossier ne demande pas « faut-il le faire »',
           'h1'))
H.append(P('Chacune a deux reponses defendables. Elles sont posees telles quelles, avec ce '
           'qui penche de chaque cote, <b>sans trancher</b> : la decision appartient a '
           'Michel, et l avis d un lecteur exterieur a de la valeur precisement parce qu il '
           'n a pas vecu le chantier.', 'petit'))
H.append(tableau(
    ['question', 'd un cote', 'de l autre'],
    [['<b>1.</b> Comment fermer V2 ?',
      'faire passer le miroir par le <b>Worker</b>, qui detient deja le jeton et peut '
      'l authentifier avant d ecrire',
      'cela ajoute une <b>dependance reseau</b> a la sauvegarde de secours - or sa raison '
      'd etre est justement d etre un second chemin, independant du premier'],
     ['<b>2.</b> Ou verifier le jeton ?',
      'dans ' + (C % 'ft_miroir') + ' : le chemin reste direct et court',
      'cela <b>duplique</b> la verification du jeton dans un troisieme endroit (Apps '
      'Script, Worker, Postgres) - une information, trois proprietaires'],
     ['<b>3.</b> Purger les ' + str(COMPTAGE['anciennes']) + ' lignes ?',
      'si personne ne peut lire, elles s effacent seules a la prochaine sauvegarde de '
      'chaque personne - <b>cout zero</b>',
      'une ligne appartenant a quelqu un qui ne rouvrira jamais l application ne sera '
      '<b>jamais</b> reecrite'],
     ['<b>4.</b> Retirer SELECT / DELETE / TRUNCATE a ' + (C % 'anon') + ' ?',
      'le client ne lit <b>jamais</b> la table (mesure : ' + str(APPELS_RPC) + ' appels '
      'RPC, ' + str(APPELS_TABLE) + ' appel direct) - le retrait semble gratuit',
      'ces droits viennent probablement des <b>reglages par defaut</b> de la plateforme ; '
      'les modifier a la main cree un ecart entre la base et ce que la plateforme croit '
      'avoir configure']],
    [36 * mm, 65 * mm, 65 * mm]))

# ── 9. CE QUE CE DOSSIER NE DIT PAS ────────────────────────────────────────────────────
H.append(P('9. Ce que ce dossier ne dit pas', 'h1'))
H.append(encadre(
    'LES BORNES, ECRITES PLUTOT QUE SOUS-ENTENDUES',
    '&gt;&gt; Il <b>ne dit pas</b> que la cle publique peut lire les sauvegardes : le '
    'privilege existe, la RLS devrait tout filtrer, et <b>personne ne l a verifie</b>.<br/>'
    '&gt;&gt; Il <b>ne dit pas</b> que ' + str(COMPTAGE['anciennes']) + ' blobs portent un '
    'jeton ou un code perso : il dit que ' + str(COMPTAGE['anciennes']) + ' lignes n ont '
    'pas ete reecrites.<br/>'
    '&gt;&gt; Il <b>ne dit pas</b> qu une exploitation depuis Internet est possible : un '
    'droit SQL n est pas un chemin reseau.<br/>'
    '&gt;&gt; Il <b>ne dit rien</b> des sauvegardes internes de la plateforme, qui ne sont '
    'pas mesurables depuis le depot.<br/>'
    '&gt;&gt; Et il <b>ne decide ni la purge ni la rotation</b> : il manque une mesure, et '
    'c est la seule qui compte.', ORANGE))
H.append(P('Mesures faites par Michel lui-meme dans le tableau de bord Supabase, depuis son '
           'telephone, en lecture seule. Dates de deploiement lues dans GitHub Actions. '
           'Le schema de la base <b>n est versionne nulle part</b> dans le depot - c est une '
           'dette connue, et c est pourquoi ces mesures ont du etre prises a la main.',
           'petit'))

# ── [!!] GARDES DE FIN ─────────────────────────────────────────────────────────────────
TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()

INTERDITS = [
    (r'la cle publique peut lire|peut lire les sauvegardes|peut lire les blobs',
     'le document AFFIRME que la cle publique peut lire : c est l etape E'),
    (r'exploitable depuis internet|une exploitation depuis internet est possible',
     'le document AFFIRME une exploitation reelle : c est l etape F'),
    (r'aucune purge n est necessaire|purge terminee',
     'le document AFFIRME qu aucune purge n est necessaire'),
    (r'postgres est superutilisateur|s execute en superutilisateur',
     'le document AFFIRME que postgres est superutilisateur : rolsuper vaut false'),
    (r'blobs? (portent|contiennent) un jeton',
     'le document AFFIRME que des blobs portent un jeton : la mesure ne dit que « pas '
     'reecrites »'),
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

# [!!] le dossier doit rester AUTONOME : les notions qu un lecteur exterieur ne peut pas
# deviner doivent y etre expliquees, pas seulement nommees.
for _mot, _pourquoi in (
        ('pseudo-role', 'sans ca, {public} se lit comme un role parmi d autres'),
        ('bypassrls', 'c est la vraie raison du contournement de la RLS'),
        ('rolsuper', 'c est la mesure qui corrige les premiers dossiers'),
        ('truncate', 'c est le seul droit que la RLS ne filtre pas'),
        ('cache', 'c est pourquoi une date de deploiement ne borne pas le code execute'),
        ('42501', 'c est ce qui rend les deux erreurs confondables'),
        ('vestigial', 'c est le statut reel des deux policies'),
        ('security definer', 'c est le premier maillon de la chaine')):
    g(_mot in _bt,
      'le dossier ne parle plus de « %s » : %s - et il est cense etre lisible sans le depot'
      % (_mot, _pourquoi))
# les 4 questions ouvertes doivent rester des QUESTIONS
g(_bt.count('?') >= 4,
  'les questions ouvertes ont disparu : ce dossier est ecrit pour etre discute, pas pour '
  'imposer une conclusion')
g('etape e' in _bt and 'etape f' in _bt,
  'le dossier ne renvoie plus aux etapes qui manquent')

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-A2 - audit Supabase A a D (dossier autonome)',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, %d lignes dont %d non reecrites, anon SELECT=%s EXECUTE=%s, '
      'client : %d RPC / %d direct)'
      % (OUT, VERSION, GARDES[0], TABLE['lignes'], COMPTAGE['anciennes'],
         PRIVS['anon']['select'], EXECUTE_FN['anon'], APPELS_RPC, APPELS_TABLE))
