#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dossier GPT — S2-A2 : PROTOCOLE D'AUDIT DU TABLEAU DE BORD SUPABASE.
   Hors depot (regle d'or #14 : le depot est public, et ce document parle d'une exposition
   NON ENCORE PURGEE).

[!!] CE DOCUMENT REMET DES REQUETES A EXECUTER A QUELQU'UN. Son garde le plus important
     n'est donc pas un chiffre : c'est que **tout le SQL qu'il contient ne fait que LIRE**.
     Un document qui donne du SQL sans prouver qu'il est inoffensif est un risque, pas un
     guide. Une seule etape ECRIT, elle est nommee, bornee a une adresse de test, et le
     garde exige qu'elle soit annoncee comme telle.

[!!] AUCUNE CLE N'EST REPRODUITE, ET C'EST STRUCTUREL : les deux tests reseau se font
     depuis la console du navigateur SUR L'APP, ou la cle publiable est deja chargee.
     Michel n'a donc jamais a copier une valeur.

[!!] Les chiffres de S2-A sont LUS dans les journaux, jamais retapes (lecon ft-v1201).

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji ; les entites sont decodees AVANT
controle (un validateur qui teste l'ENTREE d'une transformation ne dit rien de sa SORTIE).
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
    SCRATCH, 'DOSSIER-S2A2-PROTOCOLE-DASHBOARD-SUPABASE-16-09-2026.pdf')
BANC = os.environ.get('FT_BANC') or os.path.join(SCRATCH, 'banc_s2a.log')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires(src):
    """Commentaires retires, CHAINES GARDEES — pour un fait qui vit dans une CHAINE.

    [!!] L'autre outil (`sans_com`) retire aussi les chaines : l'employer pour chercher un
    SECRET rend le garde aveugle par construction, puisqu'un secret EST une chaine. Mesure
    faite en S2 : trois gardes de secret ecrits comme ca laissaient passer une cle.
    """
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


SB = lire('supabase.js')
SETUP = lire('setup.js')
RUN = lire(os.path.join('tests', 'parcours', 'runner.js'))
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]

# ── L'ETAT QUE CE DOCUMENT DECRIT, REVERIFIE ───────────────────────────────────────────
NU_SB = sans_commentaires(SB)
g('p_email: email' in NU_SB,
  'V2 semble fermee : ce protocole existe pour la MESURER encore ouverte, il est perime')
g('function _sbSansJustificatifs(' in SB,
  'le filet de S2-A a disparu : ce document decrit un etat ou la fuite future est fermee')
g(re.search(r"SB_FN\s*=\s*'ft_miroir'", NU_SB) is not None,
  'la RPC n est plus ft_miroir : toutes les requetes de ce protocole la nomment')
g(re.search(r"SB_TABLE\s*=\s*'ft_comptes'", NU_SB) is not None,
  'la table n est plus ft_comptes : toutes les requetes de ce protocole la nomment')
g('async function sbTest(' in SB,
  'le bouton de test du miroir a disparu : l etape F s appuie dessus au lieu de fabriquer '
  'un second chemin (R13)')
# l'etape F s'appuie sur sbTest, qui ecrit une adresse de TEST, pas celle de la personne
M_TEST = re.search(r"p_email\s*:\s*'([^']+)'", sans_commentaires(SB))
g(bool(M_TEST), 'sbTest n ecrit plus une adresse en dur : l etape F le suppose')
ADR_TEST = M_TEST.group(1)
g('test' in ADR_TEST.lower(),
  'l adresse ecrite par sbTest (%s) ne se nomme plus comme un test' % ADR_TEST)

N_TEM = len(re.findall(r"t\('B-CCCXIV ", RUN))
g(N_TEM == 11, 'le bloc S2-A ne porte plus 11 temoins (%d)' % N_TEM)
g('NON RETOURN' in RUN, 'le temoin volontairement NON retourne a disparu')

try:
    LB = open(BANC, encoding='utf-8').read()
except OSError:
    LB = ''
_mb = re.search(r'TOTAL S2-A\s*:\s*(\d+)\s*\S+\s*\S+\s*(\d+)', LB)
g(bool(_mb), 'le journal du banc S2-A est absent : ce document cite son total')
S2A_OK, S2A_KO = int(_mb.group(1)), int(_mb.group(2))
g(S2A_KO == 0, 'le banc S2-A porte %d rouge(s)' % S2A_KO)

# ═══════════════════════════════════════════════════════════════════════════════════════
# LES REQUETES — chacune declaree LECTURE SEULE, et le garde le VERIFIE (voir plus bas).
# ═══════════════════════════════════════════════════════════════════════════════════════
SQL_A = """select n.nspname as schema, p.proname as nom,
       pg_get_function_identity_arguments(p.oid) as arguments,
       pg_get_function_result(p.oid) as retour,
       l.lanname as langage,
       pg_get_userbyid(p.proowner) as proprietaire,
       p.prosecdef as security_definer,
       coalesce(array_to_string(p.proconfig,' | '),'AUCUN search_path fixe') as config,
       pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
join pg_language  l on l.oid = p.prolang
where p.proname = 'ft_miroir';"""

SQL_B = """select c.relname as table_, c.relrowsecurity as rls_activee,
       pg_size_pretty(pg_total_relation_size(c.oid)) as taille,
       c.reltuples::bigint as lignes_estimees
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where c.relname = 'ft_comptes';

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_name = 'ft_comptes' order by ordinal_position;

select indexname, indexdef from pg_indexes where tablename = 'ft_comptes';"""

SQL_C = """select policyname, roles, cmd, qual, with_check
from pg_policies where tablename = 'ft_comptes';"""

SQL_D = """select grantee, privilege_type
from information_schema.role_table_grants
where table_name = 'ft_comptes' and grantee in ('anon','authenticated','public');

select r.rolname as beneficiaire,
       has_function_privilege(r.rolname, p.oid, 'EXECUTE') as peut_executer
from pg_proc p cross join pg_roles r
where p.proname = 'ft_miroir' and r.rolname in ('anon','authenticated');"""

JS_E = """fetch(SB_URL + '/rest/v1/ft_comptes?select=email&limit=1',
  { headers: { apikey: SB_ANON, Authorization: 'Bearer ' + SB_ANON } })
 .then(r => r.text().then(t => console.log('HTTP', r.status, '|', t.slice(0, 300))));"""

SQL_K = """select extname, extversion from pg_extension order by extname;"""

# [!!][!!] LE GARDE QUI COMPTE LE PLUS DANS CE GENERATEUR.
# Ce document remet des requetes a executer. On prouve donc que TOUT son SQL ne fait que
# LIRE — mot par mot, sur le texte reellement imprime, pas sur une intention.
ECRITURE = ('insert', 'update', 'delete', 'drop', 'alter', 'create', 'truncate', 'grant',
            'revoke', 'copy', 'vacuum', 'reindex', 'refresh', 'call')
for nom, q in (('A', SQL_A), ('B', SQL_B), ('C', SQL_C), ('D', SQL_D), ('K', SQL_K)):
    bas = q.lower()
    for mot in ECRITURE:
        # [!!] MOT ENTIER, ET J'AI PAYE LE CONTRAIRE : ma premiere version cherchait la
        # sous-chaine `grant`, qui vit dans `role_table_grants` et `grantee` — deux noms de
        # CATALOGUE, en pure lecture. Le garde rougissait donc sur une requete parfaitement
        # inoffensive. *Un garde plus strict que la contrainte reelle refuse du travail
        # juste* (lecon ft-v1214, repayee ici).
        g(re.search(r'\b%s\b' % mot, bas) is None,
          'la requete de l etape %s contient l instruction « %s » : ce document ne remet QUE '
          'du SQL de LECTURE' % (nom, mot))
    # [!!] LE VRAI VERROU EST CELUI-CI : CHAQUE instruction commence par `select`. Il ne
    # depend d'aucune liste de mots-cles, donc aucun oubli de liste ne peut l'affaiblir.
    for inst in [x.strip() for x in bas.split(';') if x.strip()]:
        g(inst.startswith('select'),
          'une instruction de l etape %s ne commence pas par select : « %s… »'
          % (nom, inst[:40]))
# le test E ne fait qu'un GET
g("method" not in JS_E and 'ft_comptes?select=' in JS_E,
  'le test de lecture publique n est plus une simple lecture')
# aucune cle n'est reproduite : les tests reseau lisent celles deja chargees par l app
g('SB_ANON' in JS_E and 'sb_publishable' not in JS_E,
  'le test de lecture publique recopie une cle au lieu de lire celle que l app a deja')

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
                           fontSize=7.9, leading=10, textColor=ENCRE),
    'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold',
                            fontSize=7.9, leading=10, textColor=ENCRE),
}


def _v(s):
    """cp1252 APRES rendu des entites — un validateur qui teste l'entree ne dit rien de la sortie."""
    rendu = html.unescape(s)
    try:
        rendu.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE - hors cp1252 apres rendu : %r (dans %r)'
                         % (rendu[e.start:e.end], s[:70]))
    return s


def P(txt, st='p'):
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
    data = [[Paragraph(_v('<b>' + h + '</b>'), ST['cellg']) for h in entetes]]
    for r in lignes:
        data.append([Paragraph(_v(c), ST['cell']) for c in r])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), FOND),
        ('LINEBELOW', (0, 0), (-1, 0), 0.9, TRAIT),
        ('INNERGRID', (0, 1), (-1, -1), 0.3, TRAIT),
        ('BOX', (0, 0), (-1, -1), 0.5, TRAIT),
        ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 3.2), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.2),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 7)])


H = []
H.append(P('S2-A2 : auditer le tableau de bord Supabase', 'titre'))
H.append(P('Force Tracker - 16/09/2026 - base servie %s - AUDIT SEUL, aucune mutation. '
           'Le conteneur ne joint pas Supabase : ces gestes sont a faire par Michel. '
           'Document hors depot.' % VERSION, 'sous'))

H.append(encadre(
    'LES DEUX QUESTIONS QUI DECIDENT DE TOUT LE RESTE',
    '<b>1. Que fait vraiment ' + (C % 'ft_miroir') + ' ?</b> Si elle REMPLACE la ligne du '
    'compte a chaque sauvegarde, alors le code perso des six semaines <b>disparait tout '
    'seul</b> a mesure que les gens utilisent l app : il n y a rien a purger. Si elle EMPILE '
    'un historique, c est l inverse et il faut une purge explicite.<br/><br/>'
    '<b>2. Qui peut LIRE ' + (C % 'ft_comptes') + ' ?</b> L intention ecrite est « personne » '
    '- la cle publiee n a aucun droit sur la table, seulement le droit d appeler la fonction. '
    '<b>Une intention n est pas une mesure</b>, et c est elle qui decide entre purge simple, '
    'purge + rotation, ou rotation obligatoire.<br/><br/>'
    'Les quatre autres etapes (cles, plan, quotas, extensions) preparent <b>S2-B</b> ; elles '
    'ne changent pas l evaluation du risque.'))

# ── LES INTERDICTIONS
H.append(P('Ce qu il ne faut JAMAIS copier', 'h1'))
H.append(P('Aucune valeur de : <b>service_role</b>, <b>secret key</b>, <b>JWT secret</b>, '
           '<b>mot de passe de la base</b>, <b>jeton d acces prive</b>. Pour ces elements, la '
           'seule reponse utile est <b>OUI</b> ou <b>NON</b> sur leur existence.<br/><br/>'
           'Si une capture d ecran en montre une, <b>la masquer avant de l envoyer</b>. Et si '
           'la definition SQL de la fonction contenait une valeur qui ressemble a une cle - '
           'peu probable, mais on le dit avant plutot qu apres - la remplacer par '
           + (C % '[MASQUE]') + '.', 'p'))
H.append(P('Les deux tests reseau (etapes E et F) se font <b>depuis la console du navigateur, '
           'sur l app elle-meme</b>, ou la cle publiable est deja chargee. <b>Aucune valeur n a '
           'donc a etre copiee nulle part.</b>', 'petit'))

# ── LES ETAPES
H.append(P('Les etapes, dans l ordre - une a la fois', 'h1'))
H.append(tableau(
    ['', 'ou aller', 'ce qu on cherche'],
    [['<b>A</b>', 'SQL Editor', 'le SQL reel de ' + (C % 'ft_miroir') + ' : upsert ou '
      'historique ? proprietaire ? ' + (C % 'SECURITY DEFINER') + ' ? ' + (C % 'search_path')
      + ' ?'],
     ['<b>B</b>', 'SQL Editor', 'la table : colonnes, cle primaire, UNIQUE, index, RLS '
      'activee, taille - <b>une ligne par e-mail, ou plusieurs ?</b>'],
     ['<b>C</b>', 'SQL Editor', 'les policies RLS exactes (ou <b>AUCUNE POLICY</b>)'],
     ['<b>D</b>', 'SQL Editor', 'les droits reels de ' + (C % 'anon') + ' et '
      + (C % 'authenticated') + ' sur la table et sur la fonction'],
     ['<b>E</b>', 'console du navigateur', 'la cle publique peut-elle <b>LIRE</b> la table ?'],
     ['<b>F</b>', 'Profil &gt; Admin', 'la cle publique peut-elle <b>ECRIRE la ligne d une '
      'autre adresse</b> ? (le seul geste qui ecrit - voir plus bas)'],
     ['<b>I</b>', 'Project Settings &gt; API', 'existe-t-il une cle serveur ? <b>oui/non, '
      'jamais la valeur</b>'],
     ['<b>J</b>', 'Settings &gt; Usage', 'plan, region, taille de la base, quotas'],
     ['<b>K</b>', 'SQL Editor', 'extensions disponibles (' + (C % 'pgcrypto') + ', '
      + (C % 'pg_cron') + ') - pour le registre de jetons et le nettoyage']],
    [10 * mm, 38 * mm, 118 * mm]))

H.append(P('Etape A - la definition de ' + (C % 'ft_miroir'), 'h1'))
H.append(P('SQL Editor &gt; New query &gt; coller &gt; Run. <b>Lecture seule.</b> Ce qui '
           'compte est la colonne ' + (C % 'definition') + '.', 'p'))
H.append(bloc_code(SQL_A))

H.append(P('Etape B - la table ' + (C % 'ft_comptes'), 'h1'))
H.append(P('Trois requetes d un coup. <b>Lecture seule.</b> La question centrale : la cle '
           'primaire ou l index UNIQUE portent-ils sur l e-mail ? Si oui, <b>une ligne par '
           'compte</b>, donc pas d historique.', 'p'))
H.append(bloc_code(SQL_B))

H.append(P('Etape C - les policies RLS', 'h1'))
H.append(P('<b>Lecture seule.</b> Un resultat vide ne veut pas dire « pas de RLS » : il veut '
           'dire <b>aucune policy</b>. Combine avec ' + (C % 'rls_activee') + ' de l etape B, '
           'cela donne quatre cas tres differents - RLS activee sans policy (tout est refuse), '
           'RLS desactivee (tout passe), policy publique, policy authentifiee.', 'p'))
H.append(bloc_code(SQL_C))

H.append(P('Etape D - les droits reels', 'h1'))
H.append(P('<b>Lecture seule.</b> C est la mesure qui repond a la question 2.', 'p'))
H.append(bloc_code(SQL_D))

H.append(P('Etape E - la cle publique peut-elle LIRE ?', 'h1'))
H.append(P('Ouvrir l app sur un ordinateur, ouvrir la console du navigateur, coller ceci. '
           '<b>Il ne fait que lire</b>, et il emploie la cle <b>deja chargee par l app</b> : '
           'rien a copier.', 'p'))
H.append(bloc_code(JS_E))
H.append(P('Resultats possibles, tous utiles : <b>401/403</b> = refuse (l intention est '
           'tenue) - <b>200 avec ' + (C % '[]') + '</b> = autorise mais vide - <b>200 avec des '
           'donnees</b> = <b>lecture publique ouverte</b>, et l evaluation du risque change '
           'completement.', 'petit'))

H.append(encadre(
    'ETAPE F - LE SEUL GESTE QUI ECRIT, ET IL EXISTE DEJA COMME BOUTON',
    'Le bouton <b>Profil &gt; Admin &gt; test du miroir</b> fait <b>exactement</b> la '
    'demonstration de V2 : il appelle ' + (C % 'ft_miroir') + ' avec l adresse '
    + (C % ADR_TEST) + ' - <b>une adresse qui n est pas celle du compte connecte</b>. Si '
    'elle repond <b>201/204</b>, c est la preuve de bout en bout : <i>la cle publique peut '
    'ecrire la ligne d une adresse qu elle choisit.</i><br/><br/>'
    '&gt;&gt; <b>On ne fabrique donc aucun second chemin pour tester</b> (R13). Un test qui '
    'n emprunte pas le chemin de production valide le test, pas la production.<br/><br/>'
    '&gt;&gt; <b>Jamais sur une vraie adresse.</b> La ligne ecrite porte une adresse de test '
    'visible, supprimable d un clic depuis la console Supabase.', couleur=ORANGE))

H.append(P('Etape K - les extensions', 'h1'))
H.append(bloc_code(SQL_K))

# ── CE QUI EST DEJA MESURE
H.append(P('Ce qui est deja etabli (S2-A, publie en ' + VERSION + ')', 'h1'))
H.append(tableau(
    ['fait', 'etat'],
    [['fuite FUTURE du jeton et du code perso vers Supabase', '<b>fermee</b>'],
     ['snapshot metier Supabase vs Apps Script (hors justificatifs)',
      '<b>egalite stricte, a l octet pres</b>'],
     ['banc S2-A', '<b>%d OK / %d rouges</b>' % (S2A_OK, S2A_KO)],
     ['temoins permanents du bloc S2-A', '<b>%d</b>, dont un volontairement NON retourne' % N_TEM],
     ['lignes DEJA ecrites dans Supabase', '<b>non traitees</b> - c est l objet de cet audit'],
     ['V2 (' + (C % 'p_email') + ' libre)', '<b>toujours ouverte</b> - S2-B/S2-C'],
     ['exposition du jeton S1', 'moins de <b>24 h</b> (une seule version servie)'],
     ['exposition du code perso', '<b>environ six semaines</b> (depuis la naissance du miroir)']],
    [96 * mm, 70 * mm]))

H.append(encadre(
    'ET ON NE MELANGE PAS LES TROIS NIVEAUX',
    '<b>EXPOSITION POTENTIELLE</b> - la donnee a ete ecrite quelque part. <i>C est etabli.</i>'
    '<br/><b>LECTURE POSSIBLE</b> - quelqu un d autre pouvait la lire. <i>C est ce que les '
    'etapes C, D et E vont mesurer.</i>'
    '<br/><b>COMPROMISSION PROUVEE</b> - quelqu un l a lue. <i>Rien ne le montre a ce jour, '
    'et on ne l ecrira pas sans preuve.</i><br/><br/>'
    'Les trois appellent des reponses differentes. Les confondre ferait soit paniquer pour '
    'rien, soit rassurer a tort.', couleur=VERT))

H.append(P('Ce qui sera decide APRES, et pas avant', 'h1'))
H.append(P('<b>Purge</b> des anciennes lignes : necessaire ou non, selon la reponse A. '
           '<b>Rotation des jetons S1</b> et <b>changement des codes personnels</b> : classes '
           '<b>separement</b>, avec trois niveaux chacun (purge seule / purge + rotation '
           'conseillee / rotation obligatoire). &gt;&gt; <b>Rien n est choisi ici</b> : le choix '
           'depend des droits reels, et <i>decider maintenant serait deviner</i>.<br/><br/>'
           'Puis seulement : <b>S2-B</b> (Worker &gt; Supabase, registre de jetons), '
           '<b>S2-C</b> (fermeture de V2), <b>S2-D</b> (Supabase principal, Google en '
           'secours), <b>S3</b> (idempotence du debrief).', 'p'))

H.append(P('Une dette notee au passage : ' + (C % 'ft_miroir') + ' existe dans Supabase mais '
           '<b>nulle part dans le depot</b> - aucune migration, creee a la main. <i>Un schema '
           'qui ne vit que dans une console ne peut etre ni relu, ni compare, ni restaure.</i> '
           'A partir de S2-B : migrations, fonctions, policies et grants versionnes.', 'petit'))

H.append(Spacer(1, 3))
H.append(P('Document produit par ' + (C % 'tools/gen_s2a2_pdf.py') + ' - <b>' + str(GARDES[0])
           + ' gardes</b>. &gt;&gt; Le plus important n est pas un chiffre : il verifie <b>mot '
           'par mot que tout le SQL remis ici ne fait que LIRE</b>, et que le seul geste qui '
           'ecrit est annonce comme tel et borne a une adresse de test. <i>Un document qui '
           'donne du SQL sans prouver qu il est inoffensif est un risque, pas un guide.</i> '
           'Aucune cle n est reproduite.', 'petit'))

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-A2 - protocole audit dashboard Supabase',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, banc S2-A %d/%d, adresse de test %s)'
      % (OUT, VERSION, GARDES[0], S2A_OK, S2A_OK + S2A_KO, ADR_TEST))
