#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ft-v1223 — LES DEUX DEFAUTS D'AFFICHAGE DU MIROIR, CORRIGES.

[!!] LES TOTAUX SE LISENT DANS LEUR JOURNAL, JAMAIS DE MEMOIRE (lecon ft-v1201) : passe
     complete, banc cible et mutations sont EXTRAITS de leurs fichiers de sortie, et le
     generateur refuse de produire si une ligne de total manque, si le runner n'a pas fini,
     ou si un total annonce un rouge.

[!!] CE GENERATEUR EST LE MIROIR DES DEUX PRECEDENTS : ceux-la refusaient de publier si le
     defaut etait CORRIGE ; celui-ci refuse de publier s'il ne l'est PAS. On verifie donc que
     « identite refusee » a bien disparu du code et que la carte ne promet plus d'ecriture.

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
    SCRATCH, 'FT-V1223-CORRECTION-AFFICHAGE-MIROIR-18-09-2026.pdf')
LOG = os.environ.get('FT_LOG') or os.path.join(SCRATCH, 'correction_affichage_1223.log')
LOG_PASSE = os.environ.get('FT_LOG_PASSE') or '/tmp/passe1223.log'
LOG_BANC = os.environ.get('FT_LOG_BANC') or '/tmp/banc_1223.log'
LOG_MUT = os.environ.get('FT_LOG_MUT') or '/tmp/mut_1223.log'

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires(src):
    """Retire les commentaires JS, GARDE les chaines : on mesure le CODE, pas ce qui en parle."""
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


def corps_fn(src, nom):
    m = re.search(r'(?:async\s+)?function\s+' + nom + r'\s*\([^)]*\)\s*\{', src)
    g(m is not None, 'la fonction %s a disparu du code servi' % nom)
    i, p = m.end() - 1, 0
    for j in range(i, len(src)):
        if src[j] == '{':
            p += 1
        elif src[j] == '}':
            p -= 1
            if not p:
                return src[i:j + 1]
    return src[i:]


SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, ''])[1]
g(re.match(r'^ft-v\d+$', VERSION), 'la version servie n a pas pu etre lue dans sw.js')

SB = sans_commentaires(lire('supabase.js'))
HTM = lire('index.html')
ETAT = corps_fn(SB, '_sbEtatDepuis')
SONDE = corps_fn(SB, 'sbTestVoie')

# ── LA CORRECTION EST-ELLE REELLEMENT LA ? (miroir des gardes des dossiers precedents) ──
g(re.search(r'_SB_REFUS_REELS\s*=\s*\{', SB) is not None,
  'la liste blanche des vrais refus n existe pas : la correction n est pas faite')
for _k in ('revoque', 'forme', 'absent', 'inconnu'):
    g(re.search(_k + r":\s*'", SB) is not None,
      'la liste blanche ne nomme plus « %s » : un vrai refus serait dit « panne »' % _k)
g('identité refusée' not in SB,
  '« identite refusee » est encore dans le code : le defaut 1 n est pas corrige')
g('serveur indisponible' in ETAT,
  'la branche 401 ne dit plus « serveur indisponible » pour ce qui n est pas un refus')
g('_sbEstRefusReel(r)' in ETAT, 'la branche 401 ne consulte pas la liste blanche')
g("'reseau'" not in ETAT and "'refus'" not in ETAT,
  'la branche 401 enumere des PANNES : ce serait une liste noire, pas une liste blanche')
g("revoque: 'appareil révoqué" in SB,
  'la revocation n est plus dite en clair : la personne ne comprendrait pas')
g('cloud indisponible' in ETAT, 'la branche 503 a disparu')
g('_sbEstRefusReel(d.raison)' in SONDE,
  'la sonde crie encore victoire sans verifier que le refus en est un')
g('Le bouton écrit une ligne de test' not in HTM,
  'la carte promet encore une ecriture : le defaut 2 n est pas corrige')
g('teste la route sans rien écrire' in HTM,
  'la carte ne dit pas ce que le bouton fait vraiment')

# ── l etat du chantier, inchange ────────────────────────────────────────────────────────
g('p_email: email' in SB, 'V2 serait fermee : ce dossier decrit un etat intermediaire')
g("SB_VOIE = 'worker'" in SB, 'la voie par defaut n est plus celle du jeton')
g('token:SB_SONDE_JETON' in SONDE, 'la sonde ne pose plus son jeton factice')
g('function sbMirror(' in SB, 'l ancienne porte a disparu : plus de retour arriere')


def total(chemin, motif, quoi):
    g(os.path.exists(chemin), 'le journal %s est introuvable : rien a publier' % quoi)
    txt = open(chemin, encoding='utf-8', errors='replace').read()
    m = re.search(motif, txt)
    g(m is not None, 'le journal %s ne porte pas sa ligne de total (passe inachevee ?)' % quoi)
    return m


_p = total(LOG_PASSE, r'TOTAL CROIS\u00c9 : (\d+) \u2705 \u00b7 (\d+) \u274c', 'de la passe')
PASSE_OK, PASSE_KO = _p.group(1), _p.group(2)
g(PASSE_KO == '0', 'la passe complete porte %s rouge(s)' % PASSE_KO)
g('RC=0' in open(LOG_PASSE, encoding='utf-8', errors='replace').read(),
  'le runner lui-meme n a pas fini proprement (un total tronque ressemble a un total vert)')
_b = total(LOG_BANC, r'(\d+) OK / (\d+) rouge', 'du banc cible')
BANC_OK, BANC_KO = _b.group(1), _b.group(2)
g(BANC_KO == '0', 'le banc cible porte %s rouge(s)' % BANC_KO)
_m = total(LOG_MUT, r'(\d+)/(\d+) conformes', 'des mutations')
MUT_OK, MUT_TOT = _m.group(1), _m.group(2)
g(MUT_OK == MUT_TOT, 'le controle negatif n est pas complet (%s/%s)' % (MUT_OK, MUT_TOT))
g(int(MUT_TOT) >= 25, 'le controle negatif est trop maigre (%s mutations)' % MUT_TOT)

g(os.path.exists(LOG), 'le journal de la correction est introuvable')
J = open(LOG, encoding='utf-8', errors='replace').read()
g('identite refusee (reseau)' in J, 'le journal ne porte plus ce qui a ete observe a l ecran')
g(re.search(r'(?im)^voie:pont\s*:\s*NON MESURABLE', J) is not None,
  'le journal ne dit plus, sur SA ligne, que la voie « pont » reste non mesurable')
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



AV = '<font color="#C0392B"><b>avant</b></font>'
AP = '<font color="#1E7A46"><b>apres</b></font>'

H = []
# @@DEBUT@@
H.append(P('ft-v1223 - les deux defauts d affichage du miroir, corriges', 'titre'))
H.append(P('Force Tracker - 18 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>V2 n est PAS fermee</b>', 'sous'))

H.append(encadre(
    'CE QUI LEUR DONNE LEUR POIDS : ILS ONT ETE VUS A L ECRAN, PAS EN RELECTURE',
    'Le 18 septembre, pendant une vraie panne d Apps Script, la carte Admin a annonce '
    '<b>« identite refusee »</b> a quelqu un dont le compte allait parfaitement bien, et la '
    'sonde affichait un <b>succes vert</b> pendant que le serveur d identite etait en rade. '
    '<i>Le chantier entier repose sur la phrase « dire a quelqu un que son appareil est '
    'revoque alors que le cloud est simplement tombe est une erreur qu il va essayer de '
    'reparer lui-meme » - et je l avais commise un cran plus bas que la ou je l avais '
    'corrigee.</i>'))

H.append(P('1. Defaut 1 - une panne annoncee comme un refus d identite', 'h1'))
H.append(tableau(
    ['raison rendue par le pont', AV, AP],
    [['<font face="Courier">reseau</font> (Google muet) - '
      '<font face="Courier">refus</font> - <font face="Courier">erreur</font> - '
      '<font face="Courier">illisible</font>',
      '« identite refusee »', '<b>« serveur indisponible »</b>'],
     ['une raison <b>jamais vue</b>', '« identite refusee »',
      '<b>« serveur indisponible »</b>'],
     ['<font face="Courier">revoque</font>', '« appareil revoque »', '<b>inchange</b>'],
     ['<font face="Courier">forme</font> - <font face="Courier">absent</font> - '
      '<font face="Courier">inconnu</font>', 'partiel', '<b>dits en clair, un par un</b>']],
    [62 * mm, 44 * mm, 60 * mm]))
H.append(encadre(
    'UNE LISTE BLANCHE, PAS UNE LISTE DE PANNES - ET C EST TOUT LE SUJET',
    'On enumere ce qui <b>EST</b> un refus ; tout le reste est une panne. <i>Une raison '
    'NOUVELLE est bien plus probablement une anomalie qu un refus legitime</i>, et le cout de '
    'l erreur n est pas symetrique (<b>R29</b>) : dire « serveur indisponible » a un appareil '
    'vraiment revoque est benin - il verra que ca ne marche pas ; dire « identite refusee » '
    'pendant une panne envoie quelqu un reparer ce qui n est pas casse. Et '
    '<font face="Courier">revoque</font> reste dit <b>en clair</b>, sinon la personne ne '
    'comprend pas pourquoi ses sauvegardes ont cesse de partir.'))

H.append(P('2. Le meme defaut vivait dans la sonde', 'h1'))
H.append(P('Elle affichait un <b>succes</b> sur <font face="Courier">raison : refus</font>, '
           'c est-a-dire <i>pendant</i> la panne. <b>Un instrument qui annonce « tout va bien » '
           'pendant une panne est pire qu un instrument muet.</b> Le succes n est desormais '
           'merite que sur un <b>vrai</b> refus ; sinon elle nomme la panne et renvoie a la '
           'carte « Sante du systeme ».', 'p'))

H.append(P('3. Defaut 2 - la carte promettait une ecriture qui n a plus lieu', 'h1'))
H.append(bloc_code(
    "avant : « Le bouton ecrit une ligne de test POUR DE VRAI et dit ce qui cloche. »\n"
    "apres : « Le bouton teste la route SANS RIEN ECRIRE : il presente un jeton factice\n"
    "         et attend un refus. En dessous, l'etat de la DERNIERE VRAIE sauvegarde,\n"
    "         avec la voie empruntee. »"))
H.append(P('C etait vrai de l <b>ancien</b> bouton, faux depuis la bascule. <i>J avais change '
           'le comportement sans changer le texte qui le decrit</i> - <b>R23</b>, la '
           'documentation posee a cote du code qui se met a mentir.', 'petit'))

H.append(P('4. La vraie lecon : le trou etait dans mon banc', 'h1'))
H.append(encadre(
    'UN CAS QU ON N ECRIT PAS RESTE VERT POUR TOUJOURS',
    'J avais conduit 401/revoque, 401/sans-jeton, 503, et la coupure reseau <b>du telephone</b>. '
    '<b>Jamais le 401 dont la raison est une panne du PONT.</b> Ce cas a ete trouve par un vrai '
    'telephone, pas par une relecture. Le bloc <b>B-CCCXXIX</b> le comble - y compris avec une '
    'raison <b>qu on n a pas prevue</b>, qui est le temoin le plus utile du lot.'))
H.append(P('<b>Et un temoin a rougi sur du code parfaitement sain</b> - deuxieme fois que ce '
           'fichier tombe dans le meme piege, et la lecon etait ecrite juste a cote : le '
           'libelle de la revocation a quitte la fonction pour une table au niveau du fichier. '
           '<i>Un garde doit chercher le fait LA OU IL SE TROUVE - et quand un fait demenage, '
           'c est le garde qui suit, pas le code qui revient.</i>', 'p'))

H.append(P('5. Tests', 'h1'))
H.append(tableau(
    ['banc', 'resultat'],
    [['passe complete (parcours)', '<b>' + PASSE_OK + '</b> verts, <b>' + PASSE_KO + '</b> rouge'],
     ['banc cible (source + comportement)', '<b>' + BANC_OK + '</b> OK, <b>' + BANC_KO + '</b> rouge'],
     ['controle negatif (arbre clone)', '<b>' + MUT_OK + '/' + MUT_TOT + '</b> conformes, dont '
      'deux qui doivent <b>rester vertes</b>']],
    [80 * mm, 86 * mm]))
H.append(P('<b>Les deux generateurs de PDF des dossiers precedents refusent desormais de '
           'produire, et c est voulu</b> : leurs gardes a l envers interdisent de publier un '
           'dossier qui decrit un defaut deja corrige. Leur en-tete le dit, pour que personne '
           'ne les repare (<b>R30</b>).', 'petit'))

H.append(P('6. Ce que ca ne fait pas', 'h1'))
H.append(P('<b>V2 n est toujours pas fermee</b> - rien n a ete revoque, l ancienne porte garde '
           'son adresse libre. <b>Les deux voies reelles restent a mesurer</b> : elles '
           'attendent le retour d Apps Script. Nutrition, scanner, douane, journal alimentaire, '
           'Accueil, Seance, Progres, Milo : <b>zero ligne</b>. Dans '
           '<font face="Courier">index.html</font>, la seule empreinte est la carte du miroir.', 'p'))
H.append(P('<b>Regle d or #11 : rien.</b> Aucun ecran utilisateur ne change : un texte '
           'd <b>Admin</b> devient exact, et un message d erreur d <b>Admin</b> cesse de '
           'mentir.', 'petit'))
# @@FIN@@

_bt = ' '.join(TEXTES).lower()
_rendu = (_bt + ' ' + ' '.join(CODES)).lower()

for _mot, _msg in [
        ('v2 est fermee', 'le document annonce une fermeture qui n a pas eu lieu'),
        ('la bascule est validee', 'les deux voies ne sont pas mesurees')]:
    g(_mot not in _bt, _msg)

for _mot, _pourquoi in (
        ('liste blanche', 'c est la forme de la correction, pas un detail'),
        ('reste vert pour toujours', 'la lecon du trou de banc'),
        ('la ou il se trouve', 'la lecon du temoin deplace'),
        ('pire qu un instrument muet', 'le defaut de la sonde'),
        ('restent a mesurer', 'ce qui n est pas fini doit etre nomme')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='ft-v1223 - correction affichage miroir',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, passe %s/%s, banc %s, mutations %s/%s, V2 ouverte)'
      % (OUT, VERSION, GARDES[0], PASSE_OK, PASSE_KO, BANC_OK, MUT_OK, MUT_TOT))
