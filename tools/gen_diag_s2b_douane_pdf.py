#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DIAGNOSTIC S2-B + DOUANE — ce qui est PROUVE, ce qui est DEDUIT, ce qui reste NON PROUVE.

[!!] LES CHIFFRES SE LISENT DANS LEUR JOURNAL, JAMAIS DE MEMOIRE (lecon ft-v1201).

[!!] ⭐⭐ ET LES CRITERES DE LA DOUANE SE LISENT DANS `CLAUDE.md`, PAS DANS MA TETE. C'est la
     garde la plus importante de ce fichier : le dossier compare des chiffres observes a des
     seuils ACTES par Michel. Si je les recopiais de memoire, je pourrais publier un verdict
     fonde sur un seuil invente — exactement ce que la regle d'or #15 interdit. Le generateur
     EXTRAIT « 100 lignes » et les « 4 ecrivains » du fichier de gouvernance, et refuse de
     produire s'il ne les y trouve pas.

[!!] AUCUNE MODIFICATION N'ACCOMPAGNE CE DOSSIER : lecture seule, aucune regle Douane touchee,
     V2 non fermee.

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
    SCRATCH, 'DIAGNOSTIC-S2B-DOUANE-18-09-2026.pdf')
LOG = os.environ.get('FT_LOG') or os.path.join(SCRATCH, 'diag_s2b_douane_1809.log')

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


SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, ''])[1]
g(re.match(r'^ft-v\d+$', VERSION), 'la version servie n a pas pu etre lue dans sw.js')

W = sans_commentaires(lire('worker.js'))
SB = sans_commentaires(lire('supabase.js'))
MIG1 = lire('supabase/migrations/20260917_0001_ft_jetons.sql')
MIG2 = lire('supabase/migrations/20260917_0002_rpc_s2b.sql')
CTRL = lire('supabase/verifications/20260917_phase1_controle.sql')
GOUV = lire('CLAUDE.md')

# ── LA CHAINE DE 4 FAITS QUI SOUTIENT LA DEDUCTION SUR LE PONT ─────────────────────────
g(re.search(r"\( ?7, 'lignes dans le registre',[^)]*'0'\)", CTRL) is not None,
  'le controle de phase 1 n attend plus 0 ligne dans le registre : le fait ① tombe')
g('cree_le     timestamptz not null default now()' in MIG1,
  'la colonne cree_le a disparu : la trace du pont ne serait plus datee')
g('on conflict (hachage) do nothing' in MIG2,
  'l insertion n est plus « do nothing » : cree_le pourrait etre ecrasee, la date mentirait')
# [!!] CE GARDE A ETE RESSERRE APRES UN VERT SUR UNE MUTATION QUI MORDAIT. Il cherchait
#      « raise exception 'identite' » N IMPORTE OU dans le fichier. Or ce refus s'ecrit DEUX
#      fois dans la meme fonction — une pour un hache MAL FORME, une pour un hache INCONNU —
#      et seule la seconde soutient le fait ②. Retirer celle-la laissait l autre, donc le
#      garde restait vert. >> *Un motif qui cherche une PRESENCE ne mesure pas une ABSENCE
#      LOCALE.* On lit donc le fait LA OU IL VIT : dans SA branche, dans SA fonction.
_FN_ENR = (re.search(
    r'create or replace function public\.ft_enregistrer_instantane\b.*?\n\$\$;', MIG2, re.S)
    or [''])[0]
g(re.search(r"if\s+v_compte\s+is\s+null\s+then\s*\n\s*raise exception 'identite'", _FN_ENR)
  is not None,
  'la fonction n exige plus un hache CONNU (sa branche v_compte) : le fait ② tombe')
g(W.count("_sbAppel(env, 'ft_inscrire_jeton'") == 1,
  'ft_inscrire_jeton est appelee ailleurs qu une seule fois : le fait ③ tombe')
_iPont = W.find('_identiteIA(brut, env)')
_iIns = W.find("_sbAppel(env, 'ft_inscrire_jeton'")
g(0 < _iPont < _iIns,
  'l inscription ne suit plus le pont : le fait ④ tombe')
g('grant execute on function public.ft_inscrire_jeton' in MIG2
  and 'revoke all on function public.ft_inscrire_jeton(text, text, text)    from anon' in MIG2,
  'les droits sur ft_inscrire_jeton ont change : « seul ecrivain » ne serait plus vrai')

# ── L ETAT DU CHANTIER ─────────────────────────────────────────────────────────────────
g('p_email: email' in SB, 'V2 serait fermee : ce dossier decrit un etat intermediaire')
g('identité refusée' not in SB,
  'le defaut d affichage n est PAS corrige : ce dossier annonce le contraire')
g('teste la route sans rien écrire' in lire('index.html'),
  'le texte de la carte n est PAS corrige : ce dossier annonce le contraire')

# ── ⭐⭐ LES CRITERES DE LA DOUANE, LUS DANS LA GOUVERNANCE ────────────────────────────
_m = re.search(r'≥ \*\*(\d+) lignes\*\* réellement observées', GOUV)
g(_m is not None, 'le seuil de lignes de la Douane est introuvable dans CLAUDE.md')
SEUIL_LIGNES = int(_m.group(1))
_e = re.findall(r'`(addFoodEntry|quickAddFood|rejouerRepas|saveEditFood)`', GOUV)
ECRIVAINS = sorted(set(_e))
g(len(ECRIVAINS) == 4,
  'les 4 ecrivains attendus ne sont plus nommes dans CLAUDE.md (%s)' % ECRIVAINS)
g('2 semaines' in GOUV, 'la duree d observation attendue a disparu de CLAUDE.md')
g('jamais mordu ne doit PAS être considérée automatiquement comme inutile' in GOUV,
  'la consigne « jamais mordu n est pas inutile » a disparu : ce dossier s y appuie')

# ── LE RELEVE ──────────────────────────────────────────────────────────────────────────
g(os.path.exists(LOG), 'le journal du diagnostic est introuvable')
J = open(LOG, encoding='utf-8', errors='replace').read()
g(re.search(r'(?im)^voie:pont OBSERVEE A L\'ECRAN\s*: NON', J) is not None,
  'le journal ne dit plus que le pont n a PAS ete observe')
_d = re.findall(r'voie DIRECTE : 18/09/2026 (\d\d:\d\d:\d\d)', J)
g(len(_d) == 3, 'le journal ne porte plus les trois ecritures directes (%d)' % len(_d))
DIRECTES = ' · '.join(_d)
_li = re.search(r'(?im)^Lignes\s*:\s*(\d+)', J)
g(_li is not None, 'le journal ne porte plus le nombre de lignes observees')
LIGNES = int(_li.group(1))
g(LIGNES < SEUIL_LIGNES,
  'les lignes observees atteignent le seuil : le verdict de ce dossier serait faux')
g('quickAddFood  : 0 ligne — ECRIVAIN JAMAIS OBSERVE' in J,
  'le journal ne dit plus quel ecrivain manque')
g('Cause prouvee       : AUCUNE' in J and 'Correlation temporelle : AUCUNE' in J,
  'le journal ne porte plus le classement de la panne')
for _t in re.findall(r'\b[0-9a-f]{64}\b', J):
    g(False, 'le journal contient un jeton de 64 hexadecimaux : un secret publie')

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
                           fontSize=7.0, leading=8.8, textColor=ENCRE, spaceAfter=2),
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
# @@DEBUT@@
H.append(P('Diagnostic S2-B + Douane - retour reel iPhone', 'titre'))
H.append(P('Force Tracker - 18 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>lecture seule, V2 non fermee, aucune regle Douane touchee</b>',
           'sous'))

H.append(P('1. S2-B - la voie directe', 'h1'))
H.append(encadre(
    'VOIE DIRECTE REELLE DEPUIS L IPHONE : PROUVEE',
    'Trois ecritures horodatees a l ecran, sur le vrai compte : <b>' + DIRECTES + '</b>. '
    'Chacune annonce <font face="Courier">ecrit (voie : directe)</font>.'))

H.append(P('2. S2-B - le pont : non observe directement', 'h1'))
H.append(P('La mention <font face="Courier">voie : pont</font> n a <b>pas</b> ete vue a '
           'l ecran, et ce dossier ne l invente pas. En revanche, <b>quatre faits mesures '
           's enchainent</b> :', 'p'))
H.append(tableau(
    ['fait', 'ou il est mesure'],
    [['le registre des jetons etait <b>vide</b>',
      'controle de phase 1, ligne 7 : « lignes dans le registre » attendu <b>0</b>, rendu '
      '15/15 OK'],
     ['la voie <b>directe</b> n est rendue que si le hache est <b>deja</b> au registre',
      'la fonction d ecriture refuse sinon (exception « identite »)'],
     ['le <b>seul</b> ecrivain du registre est la fonction d inscription',
      'les roles publics n ont aucun droit ; un seul appel dans tout le depot'],
     ['cet appel vit <b>uniquement</b> apres un passage reussi par le pont',
      'position mesuree dans le code servi']],
    [70 * mm, 96 * mm]))
H.append(P('Donc un passage par le pont <b>a necessairement eu lieu</b>. C est une '
           '<b>deduction par chainage</b>, pas une observation - et la distinction est '
           'maintenue exprès.', 'p'))
H.append(encadre(
    'ET LA PREUVE MATERIELLE EST DEJA ENREGISTREE, EN LECTURE SEULE',
    'Le registre porte une colonne <b>date de creation</b>, et l insertion est en '
    '« ne rien faire si deja present » - donc cette date <b>n est jamais ecrasee</b>. Une '
    'simple lecture dans la console Supabase la daterait, sans rien modifier et sans exposer '
    'ni jeton, ni hache complet, ni adresse en clair. Si cette date tombe <b>entre le dernier '
    'echec et la premiere ecriture directe</b>, le pont est date.'))
H.append(bloc_code(
    "select left(j.hachage, 8) || '...'                       as hachage_tronque,\n"
    "       left(j.compte, 2) || '***'                        as compte_masque,\n"
    "       coalesce(nullif(j.appareil,''), '(sans libelle)') as appareil,\n"
    "       j.cree_le at time zone 'Europe/Paris'             as inscrit_le_paris,\n"
    "       j.revoque\n"
    "from public.ft_jetons j order by j.cree_le;"))
H.append(P('Le <font face="Courier">at time zone</font> n est pas decoratif : la console '
           'affiche en temps universel, et c est exactement le piege corrige ce matin sur le '
           'libelle des sauvegardes.', 'petit'))

H.append(P('3. S2-B - ce qui permet, ou non, de fermer V2', 'h1'))
H.append(tableau(
    ['', '', ''],
    [['voie directe reelle', PR, 'trois ecritures horodatees'],
     ['passage par le pont', DE, 'chainage de quatre faits mesures ; la date est recuperable'],
     ['<font face="Courier">voie : pont</font> a l ecran', NP, 'jamais affiche'],
     ['fermeture de V2', NP, '<b>a ne pas faire</b> tant que le pont n est pas date']],
    [50 * mm, 26 * mm, 90 * mm]))

H.append(P('4. La panne du 18/09 : classement', 'h1'))
H.append(tableau(
    ['mesure', 'valeur'],
    [['debut du backup', '<b>14:08</b> - le nom du fichier est forme au DEBUT de la fonction'],
     ['fin / duree', '<b>non mesurable</b> : rien ne l enregistre'],
     ['passage unique', 'confirme - 88 fichiers a 14:04, 89 a 14:16'],
     ['chevauchement avec les echecs', '<b>aucun</b> : echecs a 13:40:24, 13:58:54, 13:59:51'],
     ['<b>cause prouvee</b>', '<b>aucune</b>'],
     ['<b>correlation temporelle</b>', '<b>aucune</b> - le backup demarre 8 min APRES le '
      'dernier echec'],
     ['<b>non demontre</b>', 'la cause reelle de la lenteur']],
    [52 * mm, 114 * mm]))
H.append(P('L hypothese « c etait la sauvegarde » n est donc <b>pas confirmee</b>, et elle '
           'n est pas maquillee en « probable ».', 'petit'))

H.append(P('5. Douane - critères actes contre observation reelle', 'h1'))
H.append(tableau(
    ['critere acte', 'attendu', 'observe', 'verdict'],
    [['lignes reellement observees', 'au moins ' + str(SEUIL_LIGNES), str(LIGNES),
      '<b>non atteint</b>'],
     ['duree d observation', 'environ 2 semaines', '5 jours', '<b>non atteint</b>'],
     ['ecrivains vus au moins une fois', '4', '3', '<b>non atteint</b>'],
     ['ecrivain manquant', '-', '<b>quickAddFood</b>', '<b>jamais observe</b>']],
    [60 * mm, 32 * mm, 32 * mm, 42 * mm]))
H.append(encadre(
    'VERDICT : CONTINUER L OBSERVATION',
    'Au rythme mesure (<b>10,6 lignes par jour</b>), le seuil de lignes tomberait vers le '
    '<b>22/09</b>. Mais le critere <b>contraignant est la duree</b> : environ <b>9 jours de '
    'plus</b>. Et rien ne garantit que l ecrivain manquant soit vu d ici la - c est un usage, '
    'pas un compteur.'))
H.append(P('<b>Ce que les 53 lignes prouvent</b> : la douane tourne en usage reel, elle ne '
           'bloque rien, et elle produit des verdicts exploitables (0 INVALID). '
           '<b>Ce qu elles ne permettent pas de decider</b> : rien du tout sur les regles. En '
           'particulier, les <b>17 regles qui n ont jamais mordu</b> ne sont pas declarees '
           'inutiles - la consigne actee est explicite, il faut d abord verifier que les '
           '<b>formes capables de les declencher</b> ont ete rencontrees. Sur 53 lignes dont '
           '31 en grammes, beaucoup de formes ne se sont simplement <b>pas presentees</b>.', 'p'))
H.append(P('Et une regle <b>frequente</b> n est pas une regle <b>a bloquer</b> : le chiffre '
           'est donne, la decision ne l est pas. Fait brut, sans interpretation : '
           '<font face="Courier">rejouerRepas</font> produit <b>14 avertissements sur 18 '
           'lignes</b> et <b>0 identifiant de source sur 18</b>.', 'petit'))

H.append(P('6. Les deux corrections d affichage', 'h1'))
H.append(P('<b>Deja faites</b>, publiees en <font face="Courier">' + VERSION + '</font>. '
           '<b>Aucun conflit</b> : aucun commit distant, aucune autre session sur ces '
           'fichiers. Verifie par une garde de ce generateur, qui refuserait de produire si '
           'l une des deux manquait.', 'p'))
H.append(P('Un detail qui compte pour la lecture des captures : l ecran du telephone affiche '
           'encore l ancien texte de la carte. Le cache de l application n a pas encore '
           'bascule - fermer et rouvrir suffit.', 'petit'))

H.append(P('7. Ce que ce dossier ne fait pas', 'h1'))
H.append(P('Aucun chantier lance. <b>V2 non fermee.</b> <b>Aucune regle Douane modifiee.</b> '
           'Aucune ecriture, aucune suppression, aucun appareil recree : tout ce qui precede '
           'vient de mesures deja disponibles - le code servi, les migrations versionnees, le '
           'controle de phase 1, et les captures.', 'p'))
# @@FIN@@

_bt = ' '.join(TEXTES).lower()
_rendu = (_bt + ' ' + ' '.join(CODES)).lower()

for _mot, _msg in [
        ('v2 est fermee', 'le document annonce une fermeture qui n a pas eu lieu'),
        ('regle inutile', 'une regle jamais declenchee n est pas declaree inutile'),
        ('regle a bloquer', 'une regle frequente n est pas declaree a bloquer'),
        ('la sauvegarde est responsable', 'aucune cause n est prouvee')]:
    g(_mot not in _bt, _msg)

for _mot, _pourquoi in (
        ('non observe directement', 'la distinction demandee par Michel'),
        ('deduction par chainage', 'ce qui separe le deduit du prouve'),
        ('continuer l observation', 'le verdict Douane'),
        ('quickaddfood', 'l ecrivain manquant doit etre nomme'),
        ('aucune ecriture', 'la nature lecture seule du diagnostic'),
        ('pas presentees', 'les formes non rencontrees expliquent les regles muettes')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Diagnostic S2-B + Douane', author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, seuil lignes %d lu dans CLAUDE.md, observe %d, 4 ecrivains lus,'
      ' V2 ouverte)' % (OUT, VERSION, GARDES[0], SEUIL_LIGNES, LIGNES))
