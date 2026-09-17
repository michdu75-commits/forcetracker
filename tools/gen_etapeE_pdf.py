#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2A2 — ETAPE E : resultat reel de la lecture publique. Hors depot (regle d'or #14).

[!!] CETTE FOIS IL Y A UN RESULTAT, ET LE DOSSIER PORTE DONC LE NOM PREVU.
     Mesure conduite par Michel sur un PC, dans la console de son navigateur, avec les
     variables deja chargees par l'application : HTTP 200, corps vide.

[!!] LE PIEGE DE CETTE ETAPE EST L'EXCES DE SOULAGEMENT. Un `200 []` est une bonne
     nouvelle, et c'est exactement pour ca qu'il faut border ce qu'il ne dit pas :
     - il ne dit pas que les blobs anciens sont propres ;
     - il ne dit pas qu'aucune lecture n'a eu lieu dans le passe ;
     - il ne dit pas que la configuration restera ainsi ;
     - et il ne ferme PAS V2, qui est une question d'ECRITURE.

[!!] SES GARDES REFUSENT AUSSI UNE CHOSE QUE PERSONNE N'ATTEND : que le document
     recommande une PURGE sans dire qu'elle DETRUIT UNE SAUVEGARDE. Le miroir existe pour
     proteger d'une perte ; supprimer la ligne de quelqu'un qui ne revient jamais lui
     retire son filet pour retirer un justificatif que personne ne peut lire.

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
    SCRATCH, 'S2A2-ETAPE-E-LECTURE-PUBLIQUE-RESULTAT-REEL-16-09-2026.pdf')

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
HTM = lire('index.html')
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]

# ═══════════════════════════════════════════════════════════════════════════════════════
# LE RESULTAT BRUT DE E — la SOURCE de tout ce qui suit
# ═══════════════════════════════════════════════════════════════════════════════════════
E_STATUT = 200
E_CORPS = '[]'
E_COLONNE = 'updated_at'
E_BRUT = 'HTTP %d | %s' % (E_STATUT, E_CORPS)

# rappels mesures (A a D)
LIGNES, ANCIENNES, RECENTES = 10, 8, 2
ANON = {'select': True, 'insert': False, 'update': False, 'delete': True,
        'truncate': True, 'execute_ft_miroir': True, 'bypassrls': False}
POLICIES_CMDS = {'INSERT', 'UPDATE'}
FENETRE_JETON = '1h29'
EXPO_CODE_DEPUIS = '2026-08-04'

# [!!] LE NOM DES DEUX CLES A NETTOYER N'EST PAS DEVINE : il est lu dans la liste que
# S2-A a posee dans supabase.js, qui est deja LE proprietaire de cette information (R2).
_m = re.search(r'_SB_JUSTIFICATIFS\s*=\s*\[([^\]]+)\]', SB)
g(_m is not None,
  'la liste des justificatifs a disparu de supabase.js : ce dossier en tire les cles a '
  'nettoyer, il ne peut pas les inventer')
JUSTIFS = [x.strip().strip("'\"") for x in _m.group(1).split(',') if x.strip()]
g('token' in JUSTIFS and 'authCode' in JUSTIFS,
  'la liste des justificatifs ne porte plus token et authCode : ce sont les deux cles que '
  'ce dossier propose de retirer des anciens blobs')

# ═══════════════════════════════════════════════════════════════════════════════════════
# [!!] CHAQUE CONCLUSION EST RE-DERIVEE DU RESULTAT, JAMAIS TAPEE
# ═══════════════════════════════════════════════════════════════════════════════════════
REPOND = E_STATUT == 200
VIDE = E_CORPS.strip() in ('[]', '[ ]')
LECTURE_OBSERVEE = REPOND and not VIDE
g(REPOND, 'le statut mesure n est plus 200 : toute la lecture « la requete est ACCEPTEE » '
          'de ce document tombe, et avec elle la confirmation du privilege')
g(VIDE, 'le corps mesure n est plus vide : ce document conclut « aucune ligne visible », ce '
        'qui serait FAUX - et le bon dossier serait une ALERTE, pas celui-ci')
g(not LECTURE_OBSERVEE, 'une lecture a ete observee : ce dossier dit le contraire')
# le 200 corrobore D, et c'est un recoupement, pas une redite
g(ANON['select'] is True,
  'anon n aurait plus SELECT : or un 200 le CORROBORE - sans le privilege, PostgREST aurait '
  'rendu une erreur de permission, pas un tableau vide')
g(ANON['bypassrls'] is False and 'SELECT' not in POLICIES_CMDS,
  'la theorie C+D a change : ce document compare la theorie au reel, il faut refaire la '
  'comparaison')
g(ANCIENNES + RECENTES == LIGNES, 'le comptage par age ne retombe pas sur le total')

# ── L'ETAT DU DEPOT ────────────────────────────────────────────────────────────────────
g(re.match(r'^ft-v\d+$', VERSION or ''), 'la version servie n a pas pu etre lue dans sw.js')
g('p_email: email' in SB, 'le client n envoie plus un p_email libre : V2 serait deja fermee')
g('function _sbSansJustificatifs(' in SB, 'le filet de S2-A a disparu')
PHRASE_UI = ("<strong>Écriture seule</strong> : la clé publiée dans l'app ne peut pas "
             "<em>relire</em> les comptes.")
g(PHRASE_UI in HTM,
  'la phrase de la carte Admin a change : ce dossier la cite et recommande une reformulation '
  '- il faudrait le reecrire, pas le laisser tel quel')
# [!!] l'outil Admin qui ECRIT une adresse arbitraire : c'est lui qui rend F facultative
_co = SB[SB.index('async function sbTest('):]
_co = _co[:_co.index('function sbEtat(')]
g("p_email:'test@forcetracker.test'" in _co.replace(' ', ''),
  'l outil Admin n ecrit plus une adresse ARBITRAIRE : c est precisement ce qui rend '
  'l etape F facultative, et la section 9 de ce dossier en depend')
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

TEXTES = []
CODES = []


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
    # [!!] collecte a part : les gardes de securite doivent lire le CODE aussi bien que la
    # prose. Trouve par le controle negatif du dossier precedent - un garde qui ne lit que
    # la prose ne voit pas ce que dit l encadre de code.
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
H.append(P('Etape E - lecture publique, resultat reel', 'titre'))
H.append(P('Force Tracker - chantier S2-A2 (Supabase) - 16 septembre 2026 - base servie '
           + VERSION + ' - hors depot (regle d or #14) - mesure conduite sur PC, aucune '
           'mutation', 'sous'))

H.append(encadre(
    'LE RESULTAT, ET LES DEUX CHOSES DIFFERENTES QU IL PROUVE',
    'Reponse mesuree : ' + (C % E_BRUT) + '.<br/>'
    '&gt;&gt; <b>Le ' + str(E_STATUT) + ' prouve que le privilege existe.</b> Sans droit '
    + (C % 'SELECT') + ', PostgREST aurait rendu une <b>erreur de permission</b>, pas un '
    'tableau. C est donc une <b>corroboration independante</b> de l etape D, par un tout '
    'autre chemin.<br/>'
    '&gt;&gt; <b>Le ' + (C % E_CORPS) + ' prouve que la RLS filtre.</b> La table contient '
    + str(LIGNES) + ' lignes ; la requete en demandait <b>une</b>, et n en obtient '
    '<b>aucune</b>.<br/>'
    '&gt;&gt; <b>Theorie et realite coincident sur les deux points, separement.</b> '
    '<i>C est le meilleur resultat possible : si le privilege avait manque, on aurait cru la '
    'RLS efficace alors qu elle n aurait meme pas ete sollicitee.</i>', VERT))

# ── 1. LE PROTOCOLE ────────────────────────────────────────────────────────────────────
H.append(P('1. Comment la mesure a ete conduite', 'h1'))
H.append(tableau(
    ['point', 'reponse'],
    [['environnement', 'Force Tracker ouvert sur un <b>PC</b>, console developpeur du '
      'navigateur - <i>l iPhone n en a pas, c est ce qui avait bloque l etape</i>'],
     ['cle utilisee', 'la <b>vraie</b> cle publique de l application, deja chargee par la '
      'page'],
     ['cle copiee a la main', '&gt;&gt; <b>aucune</b> : les variables de connexion ont ete '
      'employees telles quelles, jamais affichees ni transmises'],
     ['colonne demandee', '&gt;&gt; <b>' + (C % E_COLONNE) + ' uniquement</b> - aucune '
      'adresse, aucune sauvegarde, aucune donnee de sante ni de nutrition'],
     ['nature de la requete', '<b>lecture seule</b> (' + (C % 'GET') + '), une seule ligne '
      'demandee']],
    [34 * mm, 132 * mm]))
H.append(bloc_code(
    "fetch(SB_URL + '/rest/v1/ft_comptes?select=updated_at&limit=1', {\n"
    "  method: 'GET',\n"
    "  headers: { apikey: SB_ANON, Authorization: 'Bearer ' + SB_ANON }\n"
    "}).then(async r => {\n"
    "  const t = await r.text();\n"
    "  console.log('HTTP', r.status, '|', t.slice(0, 300));\n"
    "});\n"
    "\n"
    "> Promise {<pending>}\n"
    "> " + E_BRUT))
H.append(P('<i>Le ' + (C % 'Promise {&lt;pending&gt;}') + ' est la valeur que la console '
           'affiche immediatement pour un appel asynchrone. Il ne fait pas partie du '
           'resultat.</i>', 'petit'))

# ── 2. THEORIE CONTRE REEL ─────────────────────────────────────────────────────────────
H.append(P('2. Ce que la theorie C + D annoncait, et ce que le reseau a repondu', 'h1'))
H.append(tableau(
    ['couche', 'mesure des etapes precedentes', 'ce que le reel a fait'],
    [['privilege SQL', (C % 'anon') + ' a ' + (C % 'SELECT') + ' sur la table (etape D)',
      '&gt;&gt; <b>confirme par le ' + str(E_STATUT) + '</b> : la requete est acceptee'],
     ['policies', 'aucune policy ' + (C % 'SELECT') + ' (etape C)',
      'rien n autorise une ligne a etre vue'],
     ['attribut du role', (C % 'anon') + ' n a pas ' + (C % 'BYPASSRLS') + ' (etape D)',
      'la RLS <b>s applique</b> a lui'],
     ['resultat attendu', '<b>zero ligne, sans erreur</b>',
      '&gt;&gt; <b>' + (C % E_BRUT) + '</b> - exactement cela']],
    [32 * mm, 66 * mm, 68 * mm]))
H.append(P('&gt;&gt; <b>Formulation retenue : lecture publique des lignes NON observee dans '
           'l etat actuel.</b> <i>« Dans l etat actuel » n est pas une precaution de style : '
           'ce qui bloque est l ABSENCE d une policy, et une absence se comble en une ligne '
           'de SQL. La protection mesuree ici est reelle, elle n est pas gravee.</i>', 'p'))

# ── 3. CE QUE E NE PROUVE PAS ──────────────────────────────────────────────────────────
H.append(P('3. Ce que ce resultat ne prouve pas', 'h1'))
H.append(encadre(
    'LE PIEGE DE CETTE ETAPE EST L EXCES DE SOULAGEMENT',
    'Un ' + (C % E_BRUT) + ' est une bonne nouvelle, et c est exactement pourquoi il faut '
    'border ce qu il ne dit pas. <i>Chaque phrase ci-dessous est ce qu on <b>refuse</b> '
    'd ecrire :</i><br/>'
    '&gt;&gt; \u00ab les ' + str(ANCIENNES) + ' blobs anciens sont propres \u00bb - leur '
    'contenu n a pas ete regarde, et ne le sera pas sans raison ;<br/>'
    '&gt;&gt; \u00ab aucune lecture n a eu lieu dans le passe \u00bb - une mesure d '
    'aujourd hui ne dit rien d hier ;<br/>'
    '&gt;&gt; qu aucun role privilegie ne peut les lire - le role de service contourne la '
    'RLS, c est sa raison d etre ;<br/>'
    '&gt;&gt; qu aucune sauvegarde interne de la plateforme n en garde une version ;<br/>'
    '&gt;&gt; que la configuration restera ainsi - ajouter une policy ' + (C % 'FOR ALL')
    + ' un jour de fatigue ouvrirait tout d un coup.<br/>'
    '&gt;&gt; <b>Et il ne ferme PAS V2</b>, qui est une question d <b>ecriture</b>. Voir 8.',
    ORANGE))

H.append(P('4. Les trois niveaux, reevalues', 'h1'))
H.append(tableau(
    ['niveau', 'etat', 'ce qui l etablit'],
    [['<b>exposition potentielle</b>', '<b>etablie</b>',
      'des justificatifs ont ete ecrits dans certains blobs. Corrige pour l avenir depuis '
      + (C % 'ft-v1217')],
     ['<b>lecture possible</b> par la cle publique', '<b>non observee</b>',
      '&gt;&gt; c est ce que E vient de mesurer, et c est la seule des trois qui a change '
      'aujourd hui'],
     ['<b>compromission</b>', '<b>non prouvee</b>',
      'aucun element ne l etablit, et aucun ne la suggere. <i>Elle reste non prouvable dans '
      'les deux sens : on ne peut pas demontrer qu une lecture n a jamais eu lieu</i>']],
    [50 * mm, 34 * mm, 82 * mm]))

H.append(PageBreak())

# ── 5. LES TROIS DECISIONS ─────────────────────────────────────────────────────────────
H.append(P('5. Les trois decisions, separees - elles n ont ni le meme cout ni les memes '
           'consequences', 'h1'))

H.append(encadre(
    'DECISION 1 - PURGE DES ' + str(ANCIENNES) + ' LIGNES : NON RECOMMANDEE, ET LA RAISON '
    'N EST PAS CELLE QU ON ATTEND',
    '&gt;&gt; <b>Une purge DETRUIT UNE SAUVEGARDE.</b> Ce miroir n est pas un journal, c est '
    'un <b>filet</b> : il existe pour qu une personne ne perde pas son historique si Google '
    'tombe. Supprimer la ligne de quelqu un qui ne revient jamais lui retire son filet - '
    '<b>pour retirer un justificatif que personne ne peut lire</b>. <i>Le remede coute plus '
    'cher que le mal qu il traite.</i><br/>'
    '&gt;&gt; <b>Et une option meilleure existe</b> : ne retirer <b>que les deux cles</b> du '
    'blob, en gardant toutes les donnees metier. La sauvegarde reste entiere, le '
    'justificatif part. <i>Ce n est pas une purge, c est un nettoyage chirurgical.</i><br/>'
    '&gt;&gt; <b>Verdict : la purge est INUTILE ; le nettoyage cible est RECOMMANDE par '
    'hygiene</b>, pas urgent. Et il se fait en une instruction, sans lire aucune valeur.'))

H.append(P('<b>Le nettoyage cible, s il est decide</b> - les deux cles ne sont pas devinees, '
           'elles sont lues dans la liste que ' + (C % 'ft-v1217') + ' a posee dans le code, '
           'qui est deja <b>le</b> proprietaire de cette information :', 'p'))
H.append(bloc_code(
    '-- MUTATION : ne PAS executer sans decision. Donnee ici pour etre relue, pas lancee.\n'
    "update public.ft_comptes\n"
    "   set data = data - 'token' - 'authCode'\n"
    " where data ?| array['token','authCode'];"))
H.append(P('&gt;&gt; <b>Elle ne lit aucune valeur</b> (l operateur teste une <b>presence</b>) '
           'et ne touche <b>que</b> les lignes concernees. Elle mettrait cependant '
           + (C % 'updated_at') + ' a jour si un declencheur existe, ce qui brouillerait le '
           'comptage par age - <i>a verifier avant, et c est exactement le genre de detail '
           'qui transforme un nettoyage propre en mesure perdue.</i>', 'petit'))

H.append(encadre(
    'LA MESURE A PRENDRE AVANT TOUTE DECISION - ET ELLE NE REVELE AUCUN SECRET',
    'On raisonne depuis trois etapes sur <b>' + str(ANCIENNES) + ' lignes potentiellement '
    'anciennes</b>. &gt;&gt; <b>Combien en portent REELLEMENT un justificatif ?</b> Personne '
    'ne le sait, et c est mesurable en une requete qui teste une <b>presence de cle</b> sans '
    'jamais en extraire la valeur :', ORANGE))
H.append(bloc_code(
    "select count(*) filter (where data ? 'token')    as lignes_avec_jeton,\n"
    "       count(*) filter (where data ? 'authCode') as lignes_avec_code,\n"
    "       count(*)                                  as total\n"
    "  from public.ft_comptes;"))
H.append(P('&gt;&gt; <b>C est la mesure qui a le meilleur rapport valeur / risque de tout le '
           'chantier</b> : elle transforme « ' + str(ANCIENNES) + ' potentiellement » en un '
           'nombre exact, en lecture seule, sans qu aucune valeur sorte. <i>Et elle peut '
           'trancher les trois decisions d un coup - si les deux comptes valent zero, il n y '
           'a plus rien a decider.</i>', 'p'))

H.append(encadre(
    'DECISION 2 - ROTATION DU JETON S1 : NON OBLIGATOIRE',
    '&gt;&gt; <b>Ce qui penche pour</b> : le jeton part <b>en clair</b> dans le blob, et il '
    'suffirait a authentifier quelqu un.<br/>'
    '&gt;&gt; <b>Ce qui penche contre</b> : la fenetre servie est de <b>' + FENETRE_JETON
    + '</b>, aucune lecture publique n est observee, aucun indice de compromission n existe, '
    'et une rotation <b>force tout le monde a refaire une preuve d identite</b> - une gene '
    'reelle, pour un risque non observe.<br/>'
    '&gt;&gt; <b>Verdict : non obligatoire.</b> Et si le nettoyage cible de la decision 1 est '
    'fait, la rotation devient <b>sans objet pour l avenir</b> : le jeton ne sera plus nulle '
    'part. <i>Elle ne protegerait plus que d une lecture passee dont rien n indique qu elle '
    'ait eu lieu.</i>'))

H.append(encadre(
    'DECISION 3 - CHANGEMENT DES CODES PERSONNELS : NON, ET C EST LA DECISION LA PLUS '
    'DELICATE DES TROIS',
    '&gt;&gt; <b>Ce qui penche pour</b> : le code perso est expose <b>depuis le '
    + EXPO_CODE_DEPUIS + '</b>, soit <b>six semaines</b> - bien plus longtemps que le jeton. '
    'C est la fuite la plus ancienne, pas la plus spectaculaire.<br/>'
    '&gt;&gt; <b>Ce qui penche contre</b> : le code est <b>optionnel</b>, donc seuls les '
    'comptes qui en ont pose un sont concernes - et on ne sait pas combien (voir la mesure '
    'ci-dessus). Aucune lecture publique n est observee. Aucune compromission n est '
    'prouvee.<br/>'
    '&gt;&gt; <b>Et cette decision-la n engage pas que Michel.</b> Les deux autres se '
    'tranchent seul, devant une base ; celle-ci demande d ecrire a des personnes reelles pour '
    'leur dire de changer quelque chose. <i>Une annonce de securite sans fait mesure derriere '
    'inquiete sans proteger</i> - et la regle d or #11 dit exactement cela : ce qui '
    'interrompt doit se meriter.<br/>'
    '&gt;&gt; <b>Verdict : non, pas maintenant.</b> Mais si un element de lecture reelle '
    'apparaissait un jour, <b>cette decision changerait de nature immediatement</b> et '
    'passerait avant les deux autres.'))

# ── 6. V2 ──────────────────────────────────────────────────────────────────────────────
H.append(P('6. V2 - E rassure sur la lecture, E ne corrige rien', 'h1'))
H.append(tableau(
    ['couche de V2', 'etat', 'preuve'],
    [['le SQL accepte un e-mail libre', '<b>confirme</b>', 'etape A, corps complet de la '
      'fonction lu'],
     [(C % 'anon') + ' a le droit d appeler', '<b>confirme</b>', 'etape D'],
     ['une ecriture aboutit reellement', '&gt;&gt; <b>voir 7</b>',
      'probablement deja demontre sans qu on l ait cherche']],
    [62 * mm, 30 * mm, 74 * mm]))
H.append(P('&gt;&gt; <b>Le ' + (C % E_BRUT) + ' ne ferme absolument pas V2.</b> E porte sur '
           'la <b>lecture</b> ; V2 est une question d <b>ecriture</b>. <i>Les deux mesures se '
           'ressemblent - meme cle, meme API - et c est precisement pour ca qu il faut le '
           'dire : un bon resultat sur l une ne dit rien de l autre.</i>', 'p'))

# ── 7. F ───────────────────────────────────────────────────────────────────────────────
H.append(P('7. L etape F est-elle encore utile ?', 'h1'))
H.append(encadre(
    'F EST FACULTATIVE - ET ELLE A PROBABLEMENT DEJA ETE CONDUITE, SANS QU ON LE VEUILLE',
    'Le bouton Admin « Copie miroir Supabase » appelle ' + (C % 'sbTest') + ', qui ecrit une '
    'ligne pour l adresse ' + (C % 'test@forcetracker.test') + ' - une adresse <b>qui n est '
    'pas celle de la personne connectee</b>, et codee en dur.<br/>'
    '&gt;&gt; <b>Donc : si ce bouton a deja repondu « Ecriture reussie » une seule fois, '
    'alors la cle publique a deja ecrit une ligne pour une adresse arbitraire.</b> C est '
    'exactement ce que F chercherait a prouver. <i>La question a poser a Michel n est pas '
    '« faut-il faire F ? » mais « as-tu deja vu ce bouton repondre en vert ? ».</i><br/>'
    '&gt;&gt; <b>Et si oui, F ne doit PAS etre relancee</b> : elle ecrirait une ligne de plus '
    'dans une base de production, qu il faudrait ensuite nettoyer - <b>une mutation payee '
    'pour une conclusion qu on a deja</b>.', VERT))
H.append(P('&gt;&gt; <b>Peut-on fermer V2 sans ecrire ? Oui.</b> Le corps de la fonction est '
           'connu <b>en entier</b> (etape A) et ne contient <b>aucun</b> controle d identite ; '
           'le droit d appeler est mesure (etape D). <i>Il n existe aucun troisieme composant '
           'qui pourrait refuser.</i> Une ecriture de test ne verifierait plus que la '
           'plomberie du reseau - or cette plomberie fonctionne, puisque le miroir ecrit '
           'tous les jours.<br/>'
           '&gt;&gt; <b>Verdict : F est FACULTATIVE, a faible valeur probante, et son cout '
           'est une mutation.</b> Le vrai sujet n est plus « V2 est-elle exploitable » mais '
           '<b>« comment la fermer »</b> - et c est S2-B.', 'p'))

# ── 8. LE TEXTE ADMIN ──────────────────────────────────────────────────────────────────
H.append(P('8. Le texte de la carte Admin - recommandation, sans modification', 'h1'))
H.append(tableau(
    ['aujourd hui', 'ce que la mesure permet enfin de dire'],
    [['<i>« Ecriture seule : la cle publiee dans l app ne peut pas relire les comptes. »</i>',
      'la <b>conclusion</b> est desormais verifiee. Mais la <b>raison</b> sous-entendue reste '
      'fausse : la cle <b>a</b> le privilege de lecture ; ce qui la bloque est l absence de '
      'regle sur la table'],
     ['(aucune date)',
      '&gt;&gt; <b>c est le manque le plus important.</b> Cette phrase decrit une '
      '<b>configuration</b>, et une configuration change. Sans date, elle se lira dans un an '
      'comme une propriete permanente - <i>exactement ce qui s est passe avec les deux '
      'affirmations du 05/08</i>']],
    [66 * mm, 100 * mm]))
H.append(P('<b>Formulation proposee</b> (a la decision de Michel, <b>non appliquee</b> dans '
           'ce chantier) : <i>« Ecriture seule : la cle publiee ne peut qu appeler la '
           'fonction d ecriture. La lecture des comptes est bloquee par les regles de '
           'securite de la table - verifie le 16/09/2026. »</i> &gt;&gt; Elle dit le bon '
           '<b>mecanisme</b>, et elle porte une <b>date</b>.', 'p'))

# ── 9. LES REPONSES ────────────────────────────────────────────────────────────────────
H.append(P('9. Les reponses', 'h1'))
QE = [['E-Q1', 'la vraie cle publique a-t-elle ete utilisee ?', OUI,
       'variables deja chargees par l application'],
      ['E-Q2', 'une cle a-t-elle ete copiee a la main ?', NON, 'aucune, a aucun moment'],
      ['E-Q3', 'le test a-t-il demande ' + (C % 'email') + ' ?', NON, C % E_COLONNE],
      ['E-Q4', 'le test a-t-il demande ' + (C % 'data') + ' ?', NON, C % E_COLONNE],
      ['E-Q5', 'l API REST a-t-elle repondu ?', OUI, C % ('HTTP %d' % E_STATUT)],
      ['E-Q6', 'une ligne a-t-elle ete visible ?', NON, C % E_CORPS],
      ['E-Q7', 'la RLS filtre-t-elle reellement sur ce chemin ?', OUI,
       'le ' + str(E_STATUT) + ' prouve le privilege, le ' + (C % E_CORPS) + ' prouve le '
       'filtrage'],
      ['E-Q8', 'lecture publique observee dans l etat actuel ?', NON,
       '&gt;&gt; <b>non observee</b> - pas « impossible pour toujours »'],
      ['E-Q9', 'peut-on affirmer qu aucune donnee ancienne n existe ?', NON,
       'aucun blob n a ete regarde'],
      ['E-Q10', 'peut-on affirmer qu aucune compromission n a eu lieu ?', NON,
       'non prouvee, et <b>non prouvable dans les deux sens</b>'],
      ['E-Q11', 'la purge est-elle obligatoire ?', NON,
       '&gt;&gt; <b>et elle n est meme pas recommandee</b> : elle detruirait une sauvegarde. '
       'Le nettoyage cible des deux cles est prefere'],
      ['E-Q12', 'la rotation du jeton est-elle obligatoire ?', NON,
       FENETRE_JETON + ' d exposition, aucune lecture observee, et un cout reel pour tout le '
       'monde'],
      ['E-Q13', 'le changement des codes perso est-il obligatoire ?', NON,
       'six semaines d exposition mais aucune lecture observee - <b>et cette decision engage '
       'd autres personnes</b>'],
      ['E-Q14', 'V2 est-elle fermee ?', NON, 'E porte sur la lecture ; V2 est une ecriture'],
      ['E-Q15', 'F est-elle encore utile ?', PART,
       '&gt;&gt; <b>facultative</b> : le bouton Admin l a probablement deja conduite, et le '
       'corps de la fonction suffit a conclure. Son cout est une mutation']]
H.append(tableau(['#', 'question', 'reponse', 'la preuve'], QE,
                 [14 * mm, 56 * mm, 20 * mm, 76 * mm]))

# ── 10. LA SUITE ───────────────────────────────────────────────────────────────────────
H.append(P('10. Ce qui reste ouvert, et dans quel ordre', 'h1'))
H.append(tableau(
    ['sujet', 'etat', 'cout'],
    [['<b>compter</b> les lignes portant reellement une cle', '&gt;&gt; <b>a faire</b> - '
      'meilleur rapport valeur / risque du chantier', 'une requete, lecture seule'],
     ['<b>nettoyage cible</b> des deux cles', 'recommande par hygiene, non urgent',
      'une mutation, a decider'],
     ['<b>fermer V2</b> (S2-B)', 'le vrai sujet restant', 'un choix d architecture'],
     ['retirer ' + (C % 'SELECT') + ' / ' + (C % 'DELETE') + ' / ' + (C % 'TRUNCATE')
      + ' a la cle publique', 'recommande - le client ne lit jamais la table',
      'des ' + (C % 'REVOKE') + ', a decider'],
     ['F', 'facultative, probablement deja conduite', 'une ecriture en production']],
    [72 * mm, 56 * mm, 38 * mm]))
H.append(P('Mesure conduite par Michel le 16/09/2026 sur PC, dans la console de son '
           'navigateur, en lecture seule. <b>Aucune mutation, aucune purge, aucune rotation, '
           'aucun changement de regle</b> n a ete effectue - ni par lui, ni par moi.', 'petit'))

# ── [!!] GARDES DE FIN ─────────────────────────────────────────────────────────────────
TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()
_rendu = (' '.join(TEXTES) + ' ' + ' '.join(CODES)).lower()

# ⛔ aucune cle, aucune URL de projet, aucune extraction de valeur
g('sb_publishable' not in _rendu and 'supabase.co' not in _rendu,
  'une cle ou l URL du projet apparait dans le document')
for _i in ('select=data', 'select=email', 'select=*', "data->", "data ->>"):
    g(_i not in _rendu,
      'le document contient « %s » : aucune requete qu il propose ne doit EXTRAIRE une '
      'valeur - seules les presences de cle sont mesurables sans risque' % _i)
g('select=updated_at' in _rendu, 'le protocole ne cite plus la colonne reellement demandee')
g(len(CODES) >= 3, 'un bloc de code a disparu : le protocole, le nettoyage et le comptage')

INTERDITS = [
    (r'lecture impossible|impossible pour toujours|ne pourra jamais etre lue',
     'le document AFFIRME une impossibilite definitive : E mesure un ETAT, a une DATE'),
    (r'les blobs sont propres|blobs anciens sont propres|aucune donnee ancienne',
     'le document AFFIRME que les blobs anciens sont propres : aucun n a ete regarde'),
    (r'v2 est fermee|v2 est corrigee',
     'le document AFFIRME que V2 est fermee : E porte sur la lecture'),
    (r'aucune compromission n a eu lieu|il n y a jamais eu de lecture',
     'le document AFFIRME l absence de compromission passee : elle est non prouvable dans '
     'les deux sens'),
    (r'la purge est necessaire|il faut purger',
     'le document RECOMMANDE une purge : elle detruirait une sauvegarde, et le nettoyage '
     'cible lui est prefere'),
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

# [!!] les reponses, dans LEUR ligne
for _q, _att in (('E-Q5', OUI), ('E-Q6', NON), ('E-Q7', OUI), ('E-Q8', NON), ('E-Q9', NON),
                 ('E-Q10', NON), ('E-Q11', NON), ('E-Q12', NON), ('E-Q13', NON),
                 ('E-Q14', NON), ('E-Q15', PART), ('E-Q2', NON)):
    _l = [r for r in QE if r[0] == _q]
    g(len(_l) == 1 and _l[0][2] == _att,
      'la question %s ne repond plus %s' % (_q, re.sub('<[^>]+>', '', _att)))
# [!!] les trois decisions restent trois
g(len([r for r in QE if r[0] in ('E-Q11', 'E-Q12', 'E-Q13')]) == 3,
  'les trois decisions ont ete remises dans le meme sac')

# [!!] les arguments sans lesquels les decisions se lisent de travers
for _mot, _pourquoi in (
        ('detruirait une sauvegarde', 'c est LA raison pour laquelle la purge est ecartee'),
        ('optionnel', 'c est ce qui borne le nombre de comptes concernes par le code perso'),
        ('non observee', 'c est la formulation exacte, et elle n est pas « impossible »'),
        ('presence', 'c est ce qui rend la mesure de comptage sans risque'),
        ('sbtest', 'c est ce qui rend F facultative'),
        ('date', 'c est ce qui manque a la phrase de la carte Admin'),
        (FENETRE_JETON.lower(), 'c est la borne de l exposition du jeton')):
    g(_mot in _bt, 'le dossier ne parle plus de « %s » : %s' % (_mot, _pourquoi))

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Etape E - lecture publique, resultat reel',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, resultat %s, lecture observee : %s, purge %s, rotation %s, '
      'codes %s, V2 %s)'
      % (OUT, VERSION, GARDES[0], E_BRUT, LECTURE_OBSERVEE, 'NON', 'NON', 'NON', 'OUVERTE'))
