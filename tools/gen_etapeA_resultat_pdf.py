#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2A2 — ETAPE A, RESULTAT REEL de `ft_miroir`. Hors depot (regle d'or #14).

[!!] CE DOCUMENT CITE UN RESULTAT EXTERIEUR AU DEPOT (le SQL lu dans le tableau de bord).
     Ses gardes ne peuvent donc pas le recompter depuis le code servi. Ils font mieux :
     **ils re-derivent CHAQUE conclusion depuis le SQL que le document imprime lui-meme.**
     Si quelqu'un modifie le SQL cite sans corriger les conclusions, le generateur refuse.
     *Un dossier qui affirme douze conclusions sur un texte doit prouver qu'elles viennent
     de CE texte.*

[!!] LE GARDE LE PLUS IMPORTANT EST UN REFUS DE CONCLURE TROP LOIN : la question 12
     (« peut-on conclure qu'aucune purge n'est necessaire ? ») doit rester NON, et le
     document doit nommer ce qui reste a mesurer. Un remplacement prouve ne vaut pas une
     purge prouvee.

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
    SCRATCH, 'S2A2-ETAPE-A-FT-MIROIR-RESULTAT-REEL-16-09-2026.pdf')

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
# LE RESULTAT BRUT, TEL QUE MICHEL L'A RAPPORTE — c'est la SOURCE de toutes les conclusions.
# ═══════════════════════════════════════════════════════════════════════════════════════
META = {
    'schema': 'public',
    'nom': 'ft_miroir',
    'arguments': 'p_email text, p_data jsonb',
    'retour': 'void',
    'langage': 'plpgsql',
    'proprietaire': 'postgres',
    'security_definer': 'true',
    'config': "search_path=public",
}

SQL = """CREATE OR REPLACE FUNCTION public.ft_miroir(p_email text, p_data jsonb)
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

_S = SQL.lower()

# ── [!!] CHAQUE CONCLUSION EST RE-DERIVEE DU SQL CITE ──────────────────────────────────
g('on conflict (email) do update' in _S,
  'le SQL cite ne porte plus « on conflict (email) do update » : la conclusion UPSERT de ce '
  'document ne vient plus de lui')
g('set data = excluded.data' in _S,
  'le SQL cite ne remplace plus la colonne data : la conclusion « remplacement complet » '
  'tombe')
for fusion in ('||', 'jsonb_set', 'jsonb_insert', 'coalesce'):
    g(fusion not in _S,
      'le SQL cite contient « %s » : il y aurait FUSION, et la conclusion « aucune fusion » '
      'de ce document serait FAUSSE — c est le cas ou une sauvegarde propre n efface PAS '
      'l ancien justificatif' % fusion)
g('security definer' in _S, 'le SQL cite n est plus SECURITY DEFINER')
g('set search_path' in _S, 'le SQL cite ne fixe plus le search_path')
g(re.search(r'\bexecute\b', _S) is None,
  'le SQL cite contient EXECUTE : il y aurait du SQL dynamique, et la conclusion « aucun SQL '
  'dynamique » tomberait')
g(re.search(r'\bdelete\b', _S) is None,
  'le SQL cite contient DELETE : la conclusion « la fonction ne supprime jamais rien » tombe')
# une SEULE table touchee
# [!!] « do update » n'est PAS une seconde ecriture : la clause ON CONFLICT vise la table de
# l'INSERT, par construction. On la neutralise AVANT de compter, sinon le mot « set » qui la
# suit est compte comme une table et le garde rougit sur du SQL parfaitement sain.
_SN = re.sub(r'\s+', ' ', _S)
_SW = _SN.replace('do update ', 'do_update ')
TABLES = (set(re.findall(r'\binto ([a-z_][a-z_0-9.]*)', _SW))
          | set(re.findall(r'\bupdate ([a-z_][a-z_0-9.]*)', _SW)))
g(TABLES == {'public.ft_comptes'},
  'le SQL cite touche %s : ce document affirme qu une SEULE table est concernee'
  % (sorted(TABLES) or 'rien'))
# la normalisation de l'e-mail
g('lower(trim(p_email))' in _S,
  'le SQL cite ne normalise plus l e-mail : le document en tire une nuance sur la casse')
# p_email n'est compare a aucune identite
g(not re.search(r'auth\.|current_user|session_user|jwt', _S),
  'le SQL cite consulte une identite : la conclusion « p_email n est borne par rien » tombe')

g(META['security_definer'] == 'true', 'la meta citee contredit le SQL sur SECURITY DEFINER')
g(META['proprietaire'] == 'postgres', 'le proprietaire cite a change')

# ── L'ETAT DU DEPOT QUE CE DOCUMENT SUPPOSE ────────────────────────────────────────────
g('p_email: email' in SB,
  'le client n envoie plus un p_email libre : la confirmation de V2 de ce document serait '
  'perimee')
g('function _sbSansJustificatifs(' in SB,
  'le filet de S2-A a disparu : le document decrit un etat ou la fuite future est fermee')
SQLS = [f for _d, _s, _f in os.walk(ROOT) for f in _f
        if f.endswith('.sql') and 'node_modules' not in _d]
g(not SQLS,
  'des fichiers SQL sont apparus dans le depot (%s) : la dette « schema non versionne » '
  'decrite ici ne serait plus exacte' % ', '.join(SQLS[:3]))

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
        ('LINEBELOW', (0, 0), (-1, 0), 0.9, TRAIT),
        ('INNERGRID', (0, 1), (-1, -1), 0.3, TRAIT),
        ('BOX', (0, 0), (-1, -1), 0.5, TRAIT),
        ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 3.2), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.2),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 7)])


H = []
H.append(P('Etape A : ' + (C % 'ft_miroir') + ' - resultat reel', 'titre'))
H.append(P('Force Tracker - 16/09/2026 - base servie %s - SQL lu dans le tableau de bord par '
           'Michel. AUDIT SEUL, aucune mutation. Document hors depot.' % VERSION, 'sous'))

H.append(encadre(
    'EN UNE PHRASE : C EST LE MEILLEUR DES CAS',
    (C % 'ft_miroir') + ' est un <b>UPSERT qui remplace la colonne entiere</b> : une seule '
    'ligne par adresse, et chaque sauvegarde ecrase la precedente. <b>Il n y a ni historique, '
    'ni fusion JSON.</b><br/><br/>'
    '&gt;&gt; Donc <b>une sauvegarde propre efface l ancien jeton et l ancien code perso</b> '
    'du blob courant, sans qu on ait rien a faire.<br/><br/>'
    '&gt;&gt; Mais <b>cela ne veut PAS dire qu aucune purge n est necessaire</b> : cela ne '
    'vaut que pour les comptes qui <b>resauvegardent</b>. Voir la question 12.', couleur=VERT))

H.append(P('1. Le resultat brut', 'h1'))
H.append(tableau(
    ['champ', 'valeur'],
    [['schema', C % META['schema']],
     ['nom', C % META['nom']],
     ['arguments', C % META['arguments']],
     ['retour', C % META['retour']],
     ['langage', C % META['langage']],
     ['proprietaire', '<b>' + (C % META['proprietaire']) + '</b>'],
     ['security_definer', '<b>' + (C % META['security_definer']) + '</b>'],
     ['config', '<b>' + (C % META['config']) + '</b>']],
    [40 * mm, 126 * mm]))
H.append(bloc_code(SQL))

H.append(P('2. Les douze reponses, chacune tiree de ce SQL', 'h1'))
Q = [['1', (C % 'p_email') + ' choisit-il la ligne ecrite ?', '<b>OUI</b>',
      (C % 'values (lower(trim(p_email)), ...)') + ' - il est la valeur de la colonne cle, et '
      '<b>rien ne le compare a une identite</b> : ni ' + (C % 'auth.uid()') + ', ni '
      + (C % 'current_user') + ', aucune verification'],
     ['2', 'insert simple, upsert, ou historique ?', '<b>UPSERT</b>',
      C % 'insert ... on conflict (email) do update'],
     ['3', 'un e-mail garde-t-il une seule ligne ?', '<b>OUI</b>',
      '&gt;&gt; deduit, et la deduction est solide : ' + (C % 'on conflict (email)') + ' '
      '<b>exige</b> une contrainte unique NON partielle sur ' + (C % 'email') + ', sinon '
      'PostgreSQL refuserait l instruction. <i>Elle existe donc necessairement.</i> Sa forme '
      'exacte reste a voir (etape B)'],
     ['4', (C % 'p_data') + ' remplace-t-il tout le blob ?', '<b>OUI</b>',
      (C % 'set data = excluded.data') + ' - la colonne entiere est ecrasee'],
     ['5', 'y a-t-il une fusion JSON ?', '<b>NON</b>',
      'aucun ' + (C % '||') + ', aucun ' + (C % 'jsonb_set') + ', aucun '
      + (C % 'coalesce') + ' - verifie mot par mot par les gardes'],
     ['6', (C % 'SECURITY DEFINER') + ' actif ?', '<b>OUI</b>', C % 'SECURITY DEFINER'],
     ['7', 'proprietaire effectif ?', '<b>' + (C % 'postgres') + '</b>',
      'la fonction s execute donc avec les droits du superutilisateur, ce qui <b>contourne la '
      'RLS</b> de la table - c est precisement pour ca qu elle fonctionne alors que la cle '
      'publique n a aucun droit sur ' + (C % 'ft_comptes')],
     ['8', 'le ' + (C % 'search_path') + ' est-il fixe ?', '<b>OUI</b>',
      C % "SET search_path TO 'public'"],
     ['9', 'quelles tables sont touchees ?', '<b>une seule</b>',
      (C % 'public.ft_comptes') + ' - aucune autre table, aucun SQL dynamique '
      '(' + (C % 'EXECUTE') + ' absent), aucun ' + (C % 'DELETE')],
     ['10', 'V2 confirmee au niveau SQL ?', '<b>OUI</b>',
      'la fonction ecrit la ligne que le client designe, sans jamais verifier qui il est. '
      '<i>La preuve de bout en bout (la cle publique peut-elle l appeler ?) reste les etapes '
      'D et F.</i>'],
     ['11', 'une sauvegarde propre efface-t-elle l ancien justificatif ?', '<b>OUI</b>',
      'consequence directe de 4 : le blob courant est remplace en entier par un blob qui, '
      'depuis ' + (C % 'ft-v1217') + ', ne porte plus ni jeton ni code perso'],
     ['12', 'peut-on conclure qu aucune purge n est necessaire ?', '<b>NON</b>',
      '&gt;&gt; voir la section 4 : il reste au moins cinq choses a mesurer']]

H.append(tableau(
    ['#', 'question', 'reponse', 'la preuve, dans le SQL ci-dessus'],
    Q, [7 * mm, 44 * mm, 19 * mm, 96 * mm]))

H.append(P('3. Deux bons points, dits sans les surestimer', 'h1'))
H.append(P('<b>Le ' + (C % 'search_path') + ' est fixe</b>, ce qui est le bon reflexe pour une '
           'fonction ' + (C % 'SECURITY DEFINER') + '. La forme la plus dure serait '
           + (C % "search_path = ''") + ' avec des noms entierement qualifies ; ici le risque '
           'residuel est <b>faible et mesurable</b> : la fonction qualifie deja '
           + (C % 'public.ft_comptes') + ' en dur, et les seules fonctions qu elle appelle '
           '(' + (C % 'lower') + ', ' + (C % 'trim') + ', ' + (C % 'now') + ') vivent dans '
           + (C % 'pg_catalog') + ', qui est consulte en premier des lors qu il n est pas '
           'nomme explicitement. <i>Un homonyme depose dans ' + (C % 'public') + ' ne la '
           'detournerait donc pas.</i><br/><br/>'
           '<b>Le privilege est eleve mais l usage est borne.</b> Tourner en '
           + (C % 'postgres') + ' est puissant ; seulement, le corps de la fonction ne sait '
           'faire <b>qu une chose</b> : un upsert sur une table nommee en dur. Aucun parametre '
           'ne choisit de table, aucun SQL n est construit a la volee. <i>Le rayon d explosion '
           'n est pas celui du role, c est celui du corps.</i>', 'p'))

H.append(P('4. Ce qu on ne sait toujours pas - et pourquoi 12 reste NON', 'h1'))
H.append(tableau(
    ['ce qui manque', 'pourquoi ca change la reponse'],
    [['les <b>comptes qui ne resauvegarderont jamais</b>',
      'le remplacement ne se declenche qu a la sauvegarde suivante. Un compte inactif ou '
      'desinstalle garde son blob <b>tel quel, indefiniment</b>'],
     ['la <b>forme exacte</b> de la contrainte sur ' + (C % 'email'),
      'deduite, pas vue. Cle primaire ? contrainte UNIQUE ? index unique ? (etape B)'],
     ['les lignes ecrites <b>avant</b> le ' + (C % 'lower(trim())'),
      'si des lignes portent des majuscules, ce sont des lignes <b>differentes</b> pour la '
      'contrainte, et elles ne seront jamais ecrasees'],
     ['le <b>nombre de lignes</b> concernees',
      'sans lui, on ne sait pas si on parle de deux comptes ou de deux cents'],
     ['<b>RLS, grants, lecture publique</b>',
      'si personne ne peut lire la table, le risque residuel est faible meme sans purge. Si '
      'quelqu un peut lire, il faut purger vite. <i>C est cette mesure qui decide.</i>'],
     ['les <b>sauvegardes internes</b> de Supabase',
      'un remplacement de ligne n efface pas les versions anterieures conservees par le '
      'fournisseur. <b>Non mesurable depuis le dossier</b> - a regarder si le risque de '
      'lecture s avere reel']],
    [56 * mm, 110 * mm]))

H.append(encadre(
    'ET UNE BONNE NOUVELLE POUR L ETAPE B : LA COLONNE ' + (C % 'updated_at') + ' EXISTE',
    'Elle est ecrite a chaque upsert (' + (C % 'updated_at = now()') + '). Donc l etape B '
    'pourra <b>compter exactement</b> combien de lignes n ont pas ete mises a jour depuis la '
    'mise en ligne du correctif - c est-a-dire <b>combien de blobs portent encore un '
    'justificatif</b>.<br/><br/>'
    '&gt;&gt; La question « faut-il purger ? » cesse d etre une opinion et devient <b>un '
    'chiffre</b>.', couleur=VERT))

H.append(P('5. Ce que ca change pour la suite', 'h1'))
H.append(P('Le cas contre-intuitif que la fiche preparatoire demandait de reperer en premier - '
           'la <b>fusion JSON</b>, ou une sauvegarde propre n efface rien - <b>est ecarte par '
           'la mesure</b>. C etait le seul scenario ou ne rien faire ne suffisait pas.<br/><br/>'
           'Reste la dette de gouvernance, inchangee : <b>ce SQL n existe nulle part dans le '
           'depot</b>. Il vient d etre lu, pas versionne. <i>Un schema qui ne vit que dans une '
           'console ne peut etre ni relu, ni compare, ni restaure.</i> A partir de S2-B : '
           'migrations, fonctions, policies et grants versionnes.<br/><br/>'
           '<b>Prochaine etape proposee : B uniquement</b> - structure de '
           + (C % 'ft_comptes') + ', contrainte reelle sur ' + (C % 'email') + ', nombre de '
           'lignes, et le comptage par ' + (C % 'updated_at') + '. Rien d autre.', 'p'))

H.append(P('Note de circonstance : ce resultat a ete obtenu par Michel lui-meme, qui a execute '
           'sa toute premiere requete SQL Supabase - depuis son telephone.', 'petit'))

# ── [!!] GARDES DE FIN : LE DOCUMENT NE DOIT PAS CONCLURE TROP LOIN ────────────────────
TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()
# [!!] LA FENETRE EST LA PHRASE, ET UNE QUESTION N EST PAS UNE AFFIRMATION.
# Deux faux rouges deja payes ici : une fenetre en caracteres qui debordait sur le titre
# precedent (ft-v1210), et ce garde qui rougissait sur la QUESTION 12 elle-meme - une phrase
# interrogative dont la reponse vit dans la cellule d a cote.
for _bloc in TEXTES:
    _b = _bloc.lower()
    for m in re.finditer(r'purge terminee|aucune purge n est necessaire', _b):
        deb = max(_b.rfind(c, 0, m.start()) for c in '.?!:') + 1
        fin = min([i for i in (_b.find(c, m.end()) for c in '.?!') if i != -1] or [len(_b)])
        phrase = _b[deb:fin + 1]
        interrogative = phrase.rstrip().endswith('?')
        niee = re.search(r"\bne\b|\bn\b|\bpas\b|\bjamais\b|\bnon\b", _b[deb:m.start()])
        g(interrogative or niee is not None,
          'le document AFFIRME qu aucune purge n est necessaire : c est exactement ce que la '
          'question 12 refuse tant que B, C et D ne sont pas faites')
# [!!] et la question 12 doit repondre NON dans SA ligne, pas quelque part dans le document
_q12 = [r for r in Q if r and r[0] == '12']
g(len(_q12) == 1 and 'purge' in _q12[0][1].lower(),
  'la question 12 (la purge) a disparu du tableau des reponses')
g(_q12 and _q12[0][2] == '<b>NON</b>',
  'la question 12 ne repond plus NON : ce document conclurait plus loin que ce qu il a mesure')
g('resauvegard' in _bt,
  'le document ne dit plus que le remplacement ne vaut QUE pour les comptes qui '
  'resauvegardent : c est la nuance qui empeche de conclure trop vite')
g('updated_at' in _bt,
  'le document ne mentionne plus updated_at : c est ce qui rendra la question mesurable en B')

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Etape A - ft_miroir, resultat reel',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, UPSERT + remplacement complet, aucune fusion)'
      % (OUT, VERSION, GARDES[0]))
