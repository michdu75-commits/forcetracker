#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fiche ETAPE A — `ft_miroir` : la requete, et la GRILLE DE LECTURE du resultat.
   Hors depot (regle d'or #14).

[!!] CE DOCUMENT NE CONCLUT RIEN, ET C'EST SON GARDE LE PLUS IMPORTANT.
     La definition de `ft_miroir` n'a pas encore ete lue : elle n'existe nulle part dans le
     depot. Un document qui annoncerait « remplacement » ou « historique » aujourd'hui
     INVENTERAIT le fait central du chantier. Les gardes refusent donc de produire si le
     texte porte un verdict, et exigent qu'il porte la mention d'attente.

[!!] SA VALEUR EST AILLEURS : il donne la grille AVANT la mesure, donc Michel peut lire son
     propre resultat sans attendre. Et il nomme le cas contre-intuitif — la FUSION JSON, ou
     une sauvegarde propre n'efface PAS l'ancien justificatif.

[!!] Tout le SQL remis ici est en LECTURE SEULE, verifie instruction par instruction.
     Aucune cle n'est reproduite.

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
    SCRATCH, 'FICHE-S2A2-ETAPE-A-FT-MIROIR-16-09-2026.pdf')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires(src):
    """Commentaires retires, CHAINES GARDEES — un fait qui vit dans une chaine se mesure ici."""
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

# ── L'ETAT DECRIT, REVERIFIE ───────────────────────────────────────────────────────────
g(re.search(r"SB_FN\s*=\s*'ft_miroir'", SB) is not None,
  'la RPC n est plus ft_miroir : toute cette fiche la nomme')
g(re.search(r"SB_TABLE\s*=\s*'ft_comptes'", SB) is not None,
  'la table n est plus ft_comptes : la grille de lecture la nomme')
g('p_email: email' in SB,
  'V2 semble fermee : cette fiche existe pour MESURER une porte encore ouverte')
g('function _sbSansJustificatifs(' in SB,
  'le filet de S2-A a disparu : la fiche decrit un etat ou la fuite future est fermee')

# ── LE SCHEMA N'EST TOUJOURS PAS DANS LE DEPOT (sinon la fiche n'a plus de raison d'etre)
SQLS = [f for _d, _s, _f in os.walk(ROOT) for f in _f
        if f.endswith('.sql') and 'node_modules' not in _d]
g(not SQLS,
  'des fichiers SQL sont apparus dans le depot (%s) : la definition serait donc lisible, et '
  'cette fiche n aurait plus lieu d etre' % ', '.join(SQLS[:3]))

REQUETE = """select
  n.nspname as schema,
  p.proname as nom,
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

# [!!] LE SQL REMIS DOIT NE FAIRE QUE LIRE — deux couches qui se recouvrent expres :
# une liste de mots-cles (faillible si incomplete) ET « chaque instruction commence par
# select » (qui ne depend d'aucune liste).
ECRITURE = ('insert', 'update', 'delete', 'drop', 'alter', 'create', 'truncate', 'grant',
            'revoke', 'copy', 'vacuum', 'reindex', 'refresh', 'call')
_bas = REQUETE.lower()
for mot in ECRITURE:
    # mot ENTIER : `grant` vit dans `role_table_grants`, un nom de catalogue en lecture.
    g(re.search(r'\b%s\b' % mot, _bas) is None,
      'la requete remise contient l instruction « %s » : cette fiche ne donne que du SQL de '
      'LECTURE' % mot)
for inst in [x.strip() for x in _bas.split(';') if x.strip()]:
    g(inst.startswith('select'),
      'une instruction de la requete ne commence pas par select : « %s… »' % inst[:40])

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
                        fontSize=8.7, leading=11.9, textColor=ENCRE, spaceAfter=5),
    'petit': ParagraphStyle('pt', parent=_ss['Normal'], fontName='Helvetica',
                            fontSize=7.6, leading=10, textColor=GRIS, spaceAfter=4),
    'code': ParagraphStyle('cd', parent=_ss['Normal'], fontName='Courier',
                           fontSize=7.1, leading=9.2, textColor=ENCRE, spaceAfter=2),
    'cell': ParagraphStyle('c', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=7.9, leading=10.1, textColor=ENCRE),
    'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold',
                            fontSize=7.9, leading=10.1, textColor=ENCRE),
}


def _v(s):
    """cp1252 APRES rendu des entites — controler l'entree ne dit rien de la sortie."""
    rendu = html.unescape(s)
    try:
        rendu.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE - hors cp1252 apres rendu : %r (dans %r)'
                         % (rendu[e.start:e.end], s[:70]))
    return s


TEXTES = []      # tout ce qui est imprime, pour les gardes de fin


def P(txt, st='p'):
    TEXTES.append(txt)
    return Paragraph(_v(txt), ST[st])


C = '<font face="Courier" size="7.4">%s</font>'


def bloc_code(txt):
    TEXTES.append(txt)
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
    # [!!] LES EN-TETES AUSSI. Ma premiere version ne ramassait que les lignes : le garde
    # « la grille est bien conditionnelle » cherchait une phrase qui vit dans l EN-TETE et
    # ne la trouvait jamais. Il rougissait donc sur un document parfaitement conforme.
    # *Un garde qui lit une collecte incomplete mesure le collecteur, pas le document.*
    TEXTES.extend(entetes)
    for r in lignes:
        TEXTES.extend(r)
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
H.append(P('Etape A : la definition reelle de ' + (C % 'ft_miroir'), 'titre'))
H.append(P('Force Tracker - 16/09/2026 - base servie %s - AUDIT SEUL. '
           'Cette fiche donne la requete ET la grille pour lire le resultat. '
           'Document hors depot.' % VERSION, 'sous'))

H.append(encadre(
    'CE DOCUMENT NE CONCLUT RIEN - ET C EST VOLONTAIRE',
    'La definition de ' + (C % 'ft_miroir') + ' <b>n a pas encore ete lue</b> : elle n existe '
    'nulle part dans le depot, elle a ete creee a la main dans le tableau de bord.<br/><br/>'
    'Ecrire aujourd hui « remplacement » ou « historique » serait <b>inventer le fait central '
    'du chantier</b>. Le verdict est donc <b>EN ATTENTE DU RESULTAT</b>, et les gardes de ce '
    'generateur refusent de produire si le texte porte une conclusion.<br/><br/>'
    '&gt;&gt; Ce que la fiche apporte : <b>la grille AVANT la mesure</b>. Michel peut lire son '
    'propre resultat sans attendre.'))

H.append(P('1. La requete - lecture seule', 'h1'))
H.append(P('Dashboard Supabase &gt; <b>SQL Editor</b> &gt; <b>New query</b> &gt; coller &gt; '
           '<b>Run</b>.', 'p'))
H.append(bloc_code(REQUETE))
H.append(P('Verifie par les gardes de ce generateur, instruction par instruction : <b>aucun '
           'mot d ecriture, et chaque instruction commence par ' + (C % 'select') + '</b>. '
           'Les deux controles se recouvrent expres - une liste de mots-cles peut etre '
           'incomplete, « commence par select » ne depend d aucune liste.', 'petit'))

H.append(P('2. Ce qu on renvoie, et ce qu on ne renvoie pas', 'h1'))
H.append(P('<b>A renvoyer</b> : tout le resultat, et surtout la colonne ' + (C % 'definition')
           + ' (le SQL complet). Capture ou texte.<br/>'
           '<b>A ne PAS renvoyer</b> : rien de ' + (C % 'Project Settings &gt; API') + ' - '
           'c est l etape I, et la seule reponse utile y sera <b>oui</b> ou <b>non</b>. '
           'Jamais une valeur de ' + (C % 'service_role') + ', de cle secrete, de '
           + (C % 'JWT secret') + ', ni le mot de passe de la base.<br/>'
           'Si la ' + (C % 'definition') + ' contenait une suite qui ressemble a une cle - peu '
           'probable, mais on le dit avant plutot qu apres - la remplacer par '
           + (C % '[MASQUE]') + '.', 'p'))

H.append(P('3. La grille de lecture - ce que chaque reponse impliquerait', 'h1'))
H.append(tableau(
    ['si la definition contient...', 'cela voudrait dire', 'consequence sur les anciennes copies'],
    [[C % 'on conflict (email) do update',
      'une seule ligne par compte, <b>mise a jour</b>',
      'chaque sauvegarde propre <b>ecrase</b> la ligne du compte'],
     [C % 'set data = p_data',
      'le blob est <b>remplace en entier</b>',
      '<b>l ancien justificatif disparait</b> avec l ancien blob'],
     ['<b>' + (C % 'data = data || p_data') + '</b><br/>(ou ' + (C % 'jsonb_set') + ')',
      '<b>fusion JSON</b> : les anciennes cles <b>survivent</b>',
      '&gt;&gt; <b>l ancien justificatif RESTE</b>, meme apres des sauvegardes propres'],
     [(C % 'insert into') + ' sans ' + (C % 'on conflict'),
      '<b>une ligne de plus</b> a chaque sauvegarde',
      'toutes les anciennes versions restent : <b>purge explicite</b> necessaire'],
     [C % 'security definer',
      'la fonction ecrit avec les droits de <b>son proprietaire</b>',
      'les policies de la table ne la bornent pas - <b>c est elle la porte</b>'],
     [(C % 'set search_path = ') + '...',
      'chemin de recherche <b>fixe</b>',
      'bon point : un objet homonyme ne peut pas la detourner'],
     ['<b>' + (C % 'AUCUN search_path fixe') + '</b>',
      'chemin <b>non fixe</b>',
      'a regarder de pres pour une fonction ' + (C % 'security definer')],
     ['un nom de table autre que ' + (C % 'ft_comptes'),
      'elle touche <b>autre chose</b> que le miroir',
      'la carte des chemins du dossier serait a refaire']],
    [50 * mm, 52 * mm, 64 * mm]))

H.append(encadre(
    'LE CAS CONTRE-INTUITIF, ET C EST LUI QU IL FAUT REPERER EN PREMIER',
    'On suppose spontanement qu une sauvegarde propre « remplace tout ». <b>Une fusion JSON '
    'ne remplace pas : elle ajoute.</b> Les cles absentes du nouveau blob <b>ne sont pas '
    'supprimees</b>, elles restent telles quelles.<br/><br/>'
    '&gt;&gt; Donc si ' + (C % 'ft_miroir') + ' fusionne, le jeton et le code perso ecrits '
    'avant le correctif <b>survivraient a toutes les sauvegardes futures</b>, et seule une '
    'purge explicite les enleverait. <i>C est le seul cas ou ne rien faire ne suffit pas.</i>'
    '<br/><br/>'
    'A chercher dans la definition : ' + (C % '||') + ' applique a une colonne '
    + (C % 'jsonb') + ', ou ' + (C % 'jsonb_set') + ', ou ' + (C % 'coalesce') + ' combinant '
    'l ancienne valeur avec la nouvelle.', couleur=ORANGE))

H.append(P('4. Ce que cette etape ne dira PAS', 'h1'))
H.append(P('Meme si la fonction s avere etre un remplacement pur, <b>on n ecrira pas « purge '
           'terminee »</b>. Cela dirait seulement que <i>les futures sauvegardes propres '
           'peuvent</i> ecraser l ancien blob. Il resterait a mesurer :<br/>'
           '- la structure reelle de ' + (C % 'ft_comptes') + ' (une ligne par compte ? index '
           'UNIQUE ?) - <b>etape B</b> ;<br/>'
           '- combien de lignes existent, et s il y a des <b>comptes inactifs</b> qui ne '
           'sauvegarderont jamais - <b>etape B</b> ;<br/>'
           '- qui peut <b>lire</b> la table - <b>etapes C, D, E</b>.<br/><br/>'
           'Un compte dont personne ne se sert plus ne se purge pas tout seul, quelle que soit '
           'la fonction.', 'p'))

H.append(encadre(
    'ET ON NE MELANGE PAS LES TROIS NIVEAUX',
    '<b>EXPOSITION POTENTIELLE</b> - la donnee a ete ecrite quelque part. <i>Etabli.</i><br/>'
    '<b>LECTURE POSSIBLE</b> - quelqu un d autre pouvait la lire. <i>C est ce que C, D et E '
    'vont mesurer.</i><br/>'
    '<b>COMPROMISSION PROUVEE</b> - quelqu un l a lue. <i>Rien ne le montre a ce jour, et on '
    'ne l ecrira pas sans preuve.</i><br/><br/>'
    'Rappel des durees, deja mesurees dans git : jeton S1 <b>moins de 24 h</b> ; code perso '
    '<b>environ six semaines</b>, et seulement pour les comptes ayant <b>pose</b> un code.',
    couleur=VERT))

H.append(P('5. Apres cette etape : STOP', 'h1'))
H.append(P('Pas d etape B, pas de RLS, pas de grants, pas de test navigateur tant que '
           'l analyse de ' + (C % 'ft_miroir') + ' n a pas ete regardee. '
           '<b>Prochaine etape proposee : B uniquement</b> (structure de la table).', 'p'))

# ── [!!] LES GARDES DE FIN : LE DOCUMENT NE CONCLUT PAS ────────────────────────────────
TOUT = ' '.join(TEXTES)
g('EN ATTENTE DU RESULTAT' in TOUT,
  'la mention d attente a disparu : sans elle, la grille se lirait comme un verdict')
# [!!] LA NEGATION COMPTE, ET J'AI PAYE LE CONTRAIRE ICI MEME : ma premiere version
# interdisait la chaine « purge terminee » n'importe ou — elle refusait donc la phrase
# « on n ECRIRA PAS "purge terminee" », c'est-a-dire exactement celle qui pose la regle.
# *Un garde qui ne voit pas la negation refuse la phrase qui l'interdit* (lecon ft-v1210,
# reposee). Le verdict n'est interdit que s'il est AFFIRME.
# [!!][!!] ET LA FENETRE EST LE BLOC, PAS UN NOMBRE DE CARACTERES. Mesure du controle
# negatif : avec une fenetre de 80 caracteres, la mutation « le document AFFIRME purge
# terminee » laissait le garde VERT — la fenetre debordait sur le TITRE de la section
# precedente, « Ce que cette etape ne dira PAS », dont le « ne … PAS » suffisait a la
# satisfaire. *Une borne en distance de caracteres n'est pas une borne de phrase*
# (BUGS.md §63, encore). On regarde donc chaque bloc de texte SEPAREMENT.
for _bloc in TEXTES:
    _b = _bloc.lower()
    for m in re.finditer(r'purge terminee', _b):
        avant = _b[:m.start()]
        g(re.search(r"\bne\b|\bn\b|\bpas\b|\bjamais\b", avant) is not None,
          'le document AFFIRME « purge terminee » : c est exactement ce qu on s interdit '
          'tant que B, C et D ne sont pas faites')
# aucune des quatre conclusions possibles ne doit apparaitre comme AFFIRMATION : chacune ne
# vit que dans la grille, donc toujours precedee d'un « si ... contient ».
for verdict in ('REMPLACEMENT COMPLET', 'UPSERT / REMPLACEMENT', 'HISTORIQUE CONFIRME'):
    g(verdict not in TOUT,
      'le document affirme « %s » alors que la definition n a pas encore ete lue' % verdict)
g('si la definition contient' in TOUT.lower(),
  'la grille n est plus presentee comme conditionnelle : elle se lirait comme un constat')
# aucune cle reproduite
g('sb_publishable' not in TOUT and 'service_role_' not in TOUT,
  'une valeur de cle apparait dans le document')

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Etape A - ft_miroir',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, aucune conclusion)' % (OUT, VERSION, GARDES[0]))
