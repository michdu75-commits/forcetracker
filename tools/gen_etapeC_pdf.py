#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2A2 — ETAPE C, POLICIES RLS reelles de `public.ft_comptes`. Hors depot (regle d'or #14).

[!!] CE DOCUMENT CITE UNE MESURE EXTERIEURE AU DEPOT (pg_policies, lu par Michel dans le
     tableau de bord). Ses gardes ne peuvent pas la recompter depuis le code servi : ils
     **re-derivent chaque conclusion depuis les deux lignes de policy imprimees plus bas**.
     Aucun « OUI/NON » du document n'est tape a la main.

[!!] LES TROIS REFUS DE CONCLURE, qui sont le coeur de l'etape :
     - « aucune policy SELECT » ne doit JAMAIS devenir « personne ne peut lire » : il reste
       les GRANT (D), les roles a BYPASSRLS, et le proprietaire ;
     - « roles = {public} » ne doit pas etre lu comme « nomme anon » : public n'est pas un
       role, c'est le pseudo-role qui les CONTIENT tous ;
     - la decision purge/rotation reste NON.

[!!] ET UNE INCERTITUDE QUI DOIT SURVIVRE : relforcerowsecurity n'a PAS ete mesure. Sans
     lui, on ne peut pas dire si ces policies servent au miroir ou ne lui servent a rien.

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
    SCRATCH, 'S2A2-ETAPE-C-POLICIES-RLS-RESULTAT-REEL-16-09-2026.pdf')

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
POLICIES = [
    # (policyname, permissive, roles, cmd, qual, with_check)
    ('ft_comptes_insert', 'PERMISSIVE', '{public}', 'INSERT', None, 'true'),
    ('ft_comptes_update', 'PERMISSIVE', '{public}', 'UPDATE', 'true', 'true'),
]
# rappels mesures aux etapes precedentes (pas des suppositions)
RLS_ACTIVEE = True                    # etape B : relrowsecurity = true
FORCE_RLS_MESUREE = False             # [!!] relforcerowsecurity : PAS mesure. Voir §6.
PROPRIETAIRE_FONCTION = 'postgres'    # etape A
FONCTION_SECURITY_DEFINER = True      # etape A

# ═══════════════════════════════════════════════════════════════════════════════════════
# [!!] CHAQUE REPONSE EST RE-DERIVEE DES LIGNES CI-DESSUS, JAMAIS TAPEE DANS LE TEXTE
# ═══════════════════════════════════════════════════════════════════════════════════════
NB = len(POLICIES)
CMDS = {p[3] for p in POLICIES}
ROLES = {p[2] for p in POLICIES}
A_SELECT = 'SELECT' in CMDS or 'ALL' in CMDS
A_INSERT = 'INSERT' in CMDS or 'ALL' in CMDS
A_UPDATE = 'UPDATE' in CMDS or 'ALL' in CMDS
A_DELETE = 'DELETE' in CMDS or 'ALL' in CMDS
PUBLIC = all('public' in p[2] for p in POLICIES)
# une condition d'identite, cherchee dans TOUTES les expressions (qual ET with_check)
EXPRS = [e for p in POLICIES for e in (p[4], p[5]) if e]
IDENT = re.compile(r'auth\.|jwt|uid|email|current_user|session_user|current_role|\brole\b',
                   re.I)
CONDITIONNEES = [e for e in EXPRS if IDENT.search(e)]
INCONDITIONNELLES = [e for e in EXPRS if e.strip().lower() == 'true']

g(NB == len(POLICIES) and NB > 0,
  'aucune policy dans la mesure : ce document en decrit %d' % NB)
g(not A_SELECT,
  'une policy SELECT apparait dans la mesure : toute la section « lecture » de ce document '
  'tombe, et sa conclusion aussi')
g(not A_DELETE,
  'une policy DELETE apparait dans la mesure : ce document affirme qu aucune suppression '
  'n est permise au niveau RLS')
g(A_INSERT and A_UPDATE,
  'les policies d ecriture mesurees ont change : ce document decrit une INSERT et une UPDATE')
g(PUBLIC,
  'les policies ne ciblent plus toutes le pseudo-role public : le raisonnement de ce '
  'document sur anon et authenticated repose la-dessus')
g(not CONDITIONNEES,
  'une policy porte enfin une condition d identite (%s) : ce document affirme le contraire, '
  'et c est son constat le plus important' % (CONDITIONNEES[:1] or ['']))
g(len(INCONDITIONNELLES) == len(EXPRS) and len(EXPRS) == 3,
  'les expressions mesurees ne sont plus « true » partout (%d expressions, %d '
  'inconditionnelles) : le constat central de ce document tombe'
  % (len(EXPRS), len(INCONDITIONNELLES)))
# l'INSERT n'a pas de USING, et c'est normal : PostgreSQL n'en accepte pas pour INSERT
_ins = [p for p in POLICIES if p[3] == 'INSERT']
g(all(p[4] is None for p in _ins),
  'une policy INSERT porte un USING : PostgreSQL n en accepte pas, la mesure serait suspecte')
g(all(p[1] == 'PERMISSIVE' for p in POLICIES),
  'une policy RESTRICTIVE apparait : elle se combinerait en ET et non en OU, ce que ce '
  'document ne decrit pas')
g(RLS_ACTIVEE is True, 'la RLS mesuree en B n est plus activee')
g(FORCE_RLS_MESUREE is False,
  'relforcerowsecurity serait mesure : ce document construit tout son §6 sur le fait qu il '
  'ne l est PAS - il faudrait le reecrire, pas le laisser tel quel')
g(FONCTION_SECURITY_DEFINER is True and PROPRIETAIRE_FONCTION == 'postgres',
  'les conclusions de l etape A sur ft_miroir ont change : le §6 de ce document en depend')

# ── L'ETAT DU DEPOT QUE CE DOCUMENT SUPPOSE ────────────────────────────────────────────
g(re.match(r'^ft-v\d+$', VERSION or ''), 'la version servie n a pas pu etre lue dans sw.js')
g('p_email: email' in SB,
  'le client n envoie plus un p_email libre : ce document decrit V2 comme encore ouverte')
g('sbCall' in SB or 'rpc/' in SB,
  'le client ne passe plus par une RPC : ce document oppose la voie RPC a la voie directe')
# ⭐ GARDE RETOURNEE LE 17/09/2026 (R30), PAS EFFACEE. Elle disait « aucun fichier SQL dans
#    le depot ». S2-B ouvre `supabase/migrations/` : le SQL versionne y est desormais LEGITIME.
#    L'invariant reel s'est precise — *aucun SQL EGARE hors du dossier versionne*. ⚠️ Et la dette
#    que ces dossiers decrivent reste VRAIE : `ft_comptes` et `ft_miroir`, creees a la main, ne
#    sont toujours pas versionnees (voir supabase/README.md).
SQLS = [f for _dd, _s, _f in os.walk(ROOT) for f in _f
        if f.endswith('.sql') and 'node_modules' not in _dd
        and os.path.join('supabase', 'migrations') not in _dd]
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
        ('GRID', (0, 0), (-1, -1), 0.35, TRAIT),
        ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 6)])


OUI, NON, PART = '<b>OUI</b>', '<b>NON</b>', '<b>PARTIEL</b>'

H = []
H.append(P('Etape C - les policies RLS de public.ft_comptes, resultat reel', 'titre'))
H.append(P('Force Tracker - chantier S2-A2 (Supabase) - 16 septembre 2026 - base servie '
           + VERSION + ' - hors depot (regle d or #14) - ' + str(NB) + ' policies mesurees, '
           'aucune mutation', 'sous'))

H.append(encadre(
    'LE RESULTAT EN UNE PHRASE',
    'Il existe <b>' + str(NB) + ' policies</b>, toutes deux en <b>ecriture</b>, toutes deux '
    'ouvertes a <b>tous les roles</b>, et toutes deux <b>sans la moindre condition</b>. '
    '&gt;&gt; Il n existe <b>aucune policy de lecture</b>. <i>Autrement dit : au niveau RLS, '
    'la table n autorise personne a lire, et n impose a personne de prouver quoi que ce soit '
    'pour ecrire.</i>'))

# ── 1. LE RESULTAT BRUT ────────────────────────────────────────────────────────────────
H.append(P('1. Le resultat brut, tel que Michel l a rapporte', 'h1'))
H.append(bloc_code(
    'policyname        | permissive | roles    | cmd    | qual | with_check\n'
    '------------------+------------+----------+--------+------+-----------\n'
    + '\n'.join('%-17s | %-10s | %-8s | %-6s | %-4s | %s'
                % (p[0], p[1], p[2], p[3], 'null' if p[4] is None else p[4], p[5])
                for p in POLICIES)))

# ── 2. LECTURE LITTERALE, POLICY PAR POLICY ────────────────────────────────────────────
H.append(P('2. Lecture litterale, policy par policy - sans rien ajouter', 'h1'))
H.append(tableau(
    ['policy', 'commande', 'roles', 'USING (qual)', 'WITH CHECK', 'ce que la ligne dit, mot a mot'],
    [[C % POLICIES[0][0], '<b>INSERT</b>', C % POLICIES[0][2], '(vide)',
      C % str(POLICIES[0][5]),
      'toute insertion est acceptee. <i>Un USING n a pas de sens pour INSERT - PostgreSQL '
      'n en accepte pas : le vide est normal, pas un oubli.</i>'],
     [C % POLICIES[1][0], '<b>UPDATE</b>', C % POLICIES[1][2], C % str(POLICIES[1][4]),
      C % str(POLICIES[1][5]),
      '&gt;&gt; <b>USING true</b> = <b>toute ligne existante</b> peut etre visee ; '
      '<b>WITH CHECK true</b> = <b>toute valeur resultante</b> est acceptee']],
    [30 * mm, 19 * mm, 18 * mm, 19 * mm, 19 * mm, 61 * mm]))
H.append(P('Les deux sont <b>PERMISSIVE</b> et portent sur des commandes differentes : elles '
           'ne se combinent pas, il n y a pas d effet croise a chercher. <i>Une policy '
           'RESTRICTIVE se combinerait en ET et pourrait tout refermer - il n y en a pas.</i>',
           'petit'))

# ── 3. « public » N'EST PAS UN ROLE ────────────────────────────────────────────────────
H.append(P('3. Le mot qui compte : ' + (C % '{public}') + ' n est pas un role', 'h1'))
H.append(encadre(
    'PUBLIC EST LE PSEUDO-ROLE QUI LES CONTIENT TOUS',
    'Dans PostgreSQL, ' + (C % 'public') + ' n est pas un role a cote de ' + (C % 'anon')
    + ' et ' + (C % 'authenticated') + ' : c est le pseudo-role auquel <b>tout role '
    'appartient</b>. &gt;&gt; Une policy qui cible ' + (C % '{public}') + ' <b>s applique '
    'donc a anon, a authenticated, et a tous les autres</b>.<br/>'
    '&gt;&gt; Mais attention au sens exact : ' + (C % 'anon') + ' n est <b>pas nomme</b> '
    'dans ces policies. <i>Il est couvert, il n est pas designe.</i> C est pour cela que les '
    'reponses C-Q4 et C-Q5 sont PARTIEL et non OUI : la policy ne dit pas « anon », elle dit '
    '« tout le monde », ce qui l inclut - et uniquement pour ecrire.', ORANGE))

# ── 4. LE CONSTAT CENTRAL ──────────────────────────────────────────────────────────────
H.append(P('4. Le constat central : aucune condition, nulle part', 'h1'))
H.append(P('Les ' + str(len(EXPRS)) + ' expressions mesurees (' + (C % 'qual') + ' et '
           + (C % 'with_check') + ' confondus) valent <b>toutes</b> ' + (C % 'true') + '. '
           '&gt;&gt; Aucune ne mentionne ' + (C % 'auth.uid()') + ', ni un JWT, ni un '
           'e-mail, ni un role, ni quoi que ce soit qui rattacherait une ligne a la personne '
           'qui la modifie. <i>Au niveau RLS, il n existe aucune notion de proprietaire de '
           'ligne dans cette table.</i>', 'p'))
H.append(encadre(
    'CE QUE CA SIGNIFIE, ET LA BORNE A NE PAS FRANCHIR',
    '&gt;&gt; <b>Si</b> un role dispose du droit ' + (C % 'UPDATE') + ' sur la table, alors '
    'la RLS ne l empechera <b>en rien</b> de reecrire <b>n importe quelle ligne</b>, y '
    'compris celle de quelqu un d autre. C est exactement la meme forme que V2 (un e-mail '
    'libre choisit la ligne), mais sur un <b>second chemin</b> : l acces direct a la table, '
    'sans passer par ' + (C % 'ft_miroir') + '.<br/>'
    '&gt;&gt; <b>Et le « si » est entier.</b> Une policy ne <b>donne</b> aucun droit : elle '
    'ne fait que <b>filtrer</b> ceux que les GRANT ont donnes. Sans droit ' + (C % 'UPDATE')
    + ' sur la table, ces policies ne servent a rien et ce second chemin n existe pas. '
    '<i>C est precisement ce que mesure l etape D, et rien ici ne permet de la devancer.</i>'))

# ── 5. LA LECTURE ──────────────────────────────────────────────────────────────────────
H.append(P('5. La lecture - ce qu on peut dire, et ou il faut s arreter', 'h1'))
H.append(P('Il n existe <b>aucune policy ' + (C % 'SELECT') + '</b>. Avec la RLS activee, '
           'un role qui y est soumis et qui interroge la table obtient <b>zero ligne</b> - '
           'la requete reussit, elle ne rend rien. <i>C est le comportement par defaut : ce '
           'qui n est pas permis est refuse.</i>', 'p'))
H.append(encadre(
    'POURQUOI CE N EST PAS ENCORE « PERSONNE NE PEUT LIRE »',
    'Trois raisons, et aucune n est theorique :<br/>'
    '&gt;&gt; <b>1) la RLS ne s applique pas a tout le monde.</b> Un role portant l attribut '
    + (C % 'BYPASSRLS') + ' la contourne entierement - chez Supabase, c est le cas du role '
    'de service. Savoir <b>quels</b> roles la contournent est l etape E.<br/>'
    '&gt;&gt; <b>2) le proprietaire de la table n y est pas soumis</b> par defaut. Voir le '
    'paragraphe suivant : cette exception n a pas ete mesuree.<br/>'
    '&gt;&gt; <b>3) les GRANT restent inconnus.</b> Ils ne peuvent pas ouvrir ce que la RLS '
    'ferme, mais ils decident de tout le reste - et c est l etape D.<br/>'
    '<i>Dire « personne ne peut lire » maintenant serait une conclusion juste par accident, '
    'tiree d une mesure qui ne la porte pas.</i>', ORANGE))

# ── 6. L'INCERTITUDE NEUVE ─────────────────────────────────────────────────────────────
H.append(P('6. Une question neuve, que cette mesure fait apparaitre', 'h1'))
H.append(P('<b>A quoi servent ces deux policies ?</b> ' + (C % 'ft_miroir') + ' est '
           + (C % 'SECURITY DEFINER') + ' et appartient a ' + (C % PROPRIETAIRE_FONCTION)
           + ' (etape A) : elle s execute donc avec les droits de son proprietaire, qui '
           '<b>n est pas soumis a la RLS</b> par defaut. &gt;&gt; Dans ce cas, <b>le miroir '
           'n a aucun besoin de ces policies</b>, et elles ne servent qu au chemin direct.',
           'p'))
H.append(encadre(
    'MAIS UNE COLONNE N A PAS ETE LUE, ET ELLE INVERSE LA REPONSE',
    'L exception du proprietaire tombe si la table porte ' + (C % 'FORCE ROW LEVEL SECURITY')
    + '. Or l etape B a mesure ' + (C % 'relrowsecurity') + ' (la RLS est activee) et '
    '<b>pas</b> ' + (C % 'relforcerowsecurity') + '.<br/>'
    '&gt;&gt; <b>Si elle vaut false</b> (le defaut) : ces policies sont <b>inutiles au '
    'miroir</b>, elles n ouvrent qu une porte laterale.<br/>'
    '&gt;&gt; <b>Si elle vaut true</b> : elles sont <b>ce qui fait marcher le miroir</b>, et '
    'les retirer casserait les sauvegardes de tout le monde.<br/>'
    '<i>Deux conclusions opposees, une seule colonne a lire. Elle se releve en une ligne, et '
    'elle n a pas ete demandee ici pour ne pas melanger deux etapes.</i>', ORANGE))

# ── 7. LES REPONSES ────────────────────────────────────────────────────────────────────
H.append(P('7. Les questions a resoudre', 'h1'))
QA = [['policy SELECT ?', NON, 'aucune ligne avec ' + (C % 'cmd = SELECT')],
      ['policy INSERT ?', OUI, C % POLICIES[0][0]],
      ['policy UPDATE ?', OUI, C % POLICIES[1][0]],
      ['policy DELETE ?', NON, 'aucune - <b>la suppression est fermee au niveau RLS</b>'],
      ['une policy cible-t-elle ' + (C % 'anon') + ' ?', PART,
       'non <b>nommee</b>, mais couverte par ' + (C % '{public}') + ' - en ecriture seule'],
      ['une policy cible-t-elle ' + (C % 'authenticated') + ' ?', PART, 'idem, meme raison'],
      ['une condition d identite (' + (C % 'auth.uid()') + ', JWT, e-mail, role) ?', NON,
       'les ' + str(len(EXPRS)) + ' expressions valent ' + (C % 'true')],
      ['la lecture directe est-elle explicitement autorisee ?', NON,
       'il n y a rien a autoriser : aucune policy ' + (C % 'SELECT') + ' n existe']]
H.append(tableau(['question', 'reponse', 'la preuve, dans les 2 lignes mesurees'], QA,
                 [62 * mm, 18 * mm, 86 * mm]))

H.append(P('8. Les questions finales', 'h1'))
QF = [['C-Q1', 'RLS activee ?', OUI, 'mesure a l etape B : ' + (C % 'relrowsecurity = true')],
      ['C-Q2', 'au moins une policy ?', OUI, str(NB) + ', nommees ci-dessus'],
      ['C-Q3', 'une policy SELECT ?', NON, 'aucune'],
      ['C-Q4', 'une policy autorise-t-elle directement ' + (C % 'anon') + ' ?', PART,
       'elle ne le <b>nomme</b> pas ; ' + (C % '{public}') + ' le <b>contient</b>. Et '
       'seulement pour <b>ecrire</b> : jamais pour lire'],
      ['C-Q5', 'directement ' + (C % 'authenticated') + ' ?', PART, 'meme reponse, meme '
       'raison'],
      ['C-Q6', 'une policy relie-t-elle la ligne a l identite reelle ?', NON,
       '&gt;&gt; <b>aucune</b>. C est le constat le plus important de l etape'],
      ['C-Q7', 'peut-on conclure que ' + (C % 'anon') + ' ne peut PAS lire ?', NON,
       'il reste les GRANT (D), les roles a ' + (C % 'BYPASSRLS') + ' (E) et l exception du '
       'proprietaire - voir 5'],
      ['C-Q8', 'peut-on decider purge / rotation ?', NON,
       'l incertitude a encore baisse, mais le facteur decisif - <b>qui peut lire</b> - '
       'n est toujours pas mesure']]
H.append(tableau(['#', 'question', 'reponse', 'la preuve'], QF,
                 [12 * mm, 52 * mm, 18 * mm, 84 * mm]))

# ── 9. BILAN ───────────────────────────────────────────────────────────────────────────
H.append(P('9. Ce qu on sait maintenant, et ce qu on ignore encore', 'h1'))
H.append(tableau(
    ['on le sait, et c est mesure', 'on l ignore encore'],
    [['aucune policy de lecture : la RLS ne permet a personne d en lire',
      '<b>les GRANT reels</b> - ils decident si les policies d ecriture servent a '
      'quelque chose (D)'],
     ['aucune policy DELETE : la suppression est fermee de ce cote',
      'quels roles portent ' + (C % 'BYPASSRLS') + ' (E)'],
     ['les 2 policies d ecriture sont <b>inconditionnelles</b> et valent pour tous',
      '&gt;&gt; ' + (C % 'relforcerowsecurity') + ' - <b>une colonne</b>, et elle decide si '
      'ces policies servent au miroir ou ne lui servent a rien'],
     ['aucune notion de proprietaire de ligne au niveau RLS',
      'si la table est exposee par l API REST'],
     ['aucune RESTRICTIVE ne vient refermer quoi que ce soit',
      'ce que les ' + str(NB) + ' policies changent <b>en pratique</b> - rien, tant que D '
      'n est pas lue']],
    [80 * mm, 86 * mm]))

H.append(P('<b>Prochaine etape proposee : D uniquement</b> - les GRANT reels sur '
           + (C % 'ft_comptes') + ' et sur ' + (C % 'ft_miroir') + '. <i>Et, tant qu on y '
           'est, la colonne ' + (C % 'relforcerowsecurity') + ' : une ligne de plus, et elle '
           'repond a la question du 6.</i>', 'p'))
H.append(P('Mesure faite par Michel dans le tableau de bord Supabase, depuis son telephone. '
           'Aucune mutation : la requete de cette etape ne contenait qu un ' + (C % 'select')
           + '.', 'petit'))

# ── [!!] GARDES DE FIN : LE DOCUMENT NE DOIT PAS CONCLURE TROP LOIN ────────────────────
TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()

INTERDITS = [
    (r'personne ne peut lire|nul ne peut lire|anon ne peut pas lire',
     'le document AFFIRME que personne ne peut lire : c est l etape D, et il reste '
     'BYPASSRLS et le proprietaire'),
    (r'la table est ouverte a tous|n importe qui peut ecrire|tout le monde peut ecrire',
     'le document AFFIRME qu une ecriture directe est possible : une policy ne DONNE aucun '
     'droit, elle filtre ceux que les GRANT ont donnes'),
    (r'aucune purge n est necessaire|purge terminee',
     'le document AFFIRME qu aucune purge n est necessaire : rien ici ne permet de le dire'),
    (r'ces policies sont inutiles|policies inutiles',
     'le document AFFIRME que les policies sont inutiles : cela depend de '
     'relforcerowsecurity, qui n a pas ete mesure'),
]
# [!!] TROIS FACONS D EMPLOYER UNE PHRASE INTERDITE SANS L AFFIRMER, ET IL A FALLU LES
# TROIS. Payees une par une, sur du texte parfaitement sain :
#   - la QUESTION (« peut-on conclure que... ? ») : reconnue au point d interrogation ;
#   - la NEGATION qui precede (« on ne peut pas dire que... ») ;
#   - et la MENTION ENTRE GUILLEMETS (« dire "personne ne peut lire" serait faux »), qui
#     est le cas vicieux : la negation arrive APRES, et chercher « ne » dans toute la
#     phrase ne sert a rien puisque « personne NE peut lire » en contient un.
#     >> Ce document met entre guillemets, exactement, les phrases qu il refuse.
# Et le deux-points n est PAS une fin de phrase : « Si elle vaut false : ... » perdait sa
# condition quand il coupait la.
def _mentionnee(txt, i):
    """i tombe-t-il a l interieur d une paire de guillemets ?"""
    ouvre = txt.rfind('«', 0, i)
    if ouvre < 0:
        return False
    ferme = txt.find('»', ouvre)
    return ferme > i


for _bloc in TEXTES:
    _b = _bloc.lower()
    for _mot, _msg in INTERDITS:
        for m in re.finditer(_mot, _b):
            deb = max(_b.rfind(c, 0, m.start()) for c in '.?!') + 1
            fin = min([i for i in (_b.find(c, m.end()) for c in '.?!') if i != -1]
                      or [len(_b)])
            phrase = _b[deb:fin + 1]
            interrogative = phrase.rstrip().endswith('?')
            citee = _mentionnee(_b, m.start())
            niee = re.search(r"\bne\b|\bn\b|\bpas\b|\bjamais\b|\bni\b|\bnon\b|\bsi\b",
                             _b[deb:m.start()])
            g(interrogative or citee or niee is not None, _msg)

# [!!] les refus de conclure se verifient dans LEUR ligne, pas « quelque part »
for _q, _att in (('C-Q6', NON), ('C-Q7', NON), ('C-Q8', NON), ('C-Q3', NON),
                 ('C-Q4', PART), ('C-Q5', PART), ('C-Q1', OUI), ('C-Q2', OUI)):
    _l = [r for r in QF if r[0] == _q]
    g(len(_l) == 1 and _l[0][2] == _att,
      'la question %s ne repond plus %s : ce document conclurait autrement que ce qu il a '
      'mesure' % (_q, re.sub('<[^>]+>', '', _att)))

# [!!] les nuances sans lesquelles le document se lirait de travers
g('relforcerowsecurity' in _bt,
  'le document ne parle plus de relforcerowsecurity : c est la colonne qui decide si ces '
  'policies servent au miroir ou non, et elle n est PAS mesuree')
g('bypassrls' in _bt,
  'le document ne mentionne plus BYPASSRLS : c est une des trois raisons pour lesquelles '
  '« aucune policy SELECT » ne veut pas dire « personne ne peut lire »')
g('pseudo-role' in _bt,
  'le document n explique plus que public est un pseudo-role : sans ca, {public} se lit '
  'comme un role parmi d autres et tout le paragraphe 3 s effondre')
g('filtrer' in _bt or 'filtre' in _bt,
  'le document ne dit plus qu une policy FILTRE des droits au lieu d en donner : c est ce '
  'qui empeche de conclure a une ecriture directe avant l etape D')
g(str(len(EXPRS)) in _bt, 'le nombre d expressions mesurees a disparu du document')

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Etape C - policies RLS de ft_comptes',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, %d policies, commandes %s, %d expressions toutes true)'
      % (OUT, VERSION, GARDES[0], NB, '+'.join(sorted(CMDS)), len(EXPRS)))
