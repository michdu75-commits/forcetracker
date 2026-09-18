#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B — POINT D : CE QUE LA MESURE EN RESEAU REEL PROUVE, ET CE QU'ELLE NE PROUVE PAS.

[!!] LE RELEVE SE LIT DANS SON JOURNAL, JAMAIS DE MEMOIRE. La ligne « STATUT 401 | ... »
     est EXTRAITE du journal de mesure, et le generateur refuse de produire si elle manque,
     si le code n'est pas 401, ou si la raison n'est pas celle observee. Lecon de ft-v1201 :
     un PDF qui recopie un chiffre de tete publie un chiffre de tete.

[!!] IL REFUSE AUSSI DE PRODUIRE :
     - si V2 n'est plus ouverte (le client n'enverrait plus `p_email`) — ce document decrit
       un etat intermediaire, et un dossier qui decrit un etat qu'il n'a pas verifie se
       perime en silence ;
     - si le journal contient un jeton de 64 hexadecimaux AUTRE que les 64 zeros — c'est-a-
       dire si un VRAI jeton s'y etait glisse ;
     - si « inconnu » devenait une chaine litterale de worker.js : toute la lecture de ce
       document repose sur le fait que cette raison ne peut venir QUE du pont Apps Script.

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
    SCRATCH, 'S2B-MESURE-RESEAU-REEL-18-09-2026.pdf')
LOG = os.environ.get('FT_LOG') or os.path.join(SCRATCH, 'mesure_s2b_reelle.log')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires(src):
    """Retire commentaires JS mais GARDE les chaines. Sans ca, une garde mesurerait la
    DOCUMENTATION du fichier au lieu de son code — famille de defauts payee cinq fois."""
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
    d = src.find('function ' + nom + '(')
    g(d >= 0, 'la fonction %s a disparu du code servi' % nom)
    i, p = src.find('{', d), 0
    for j in range(i, len(src)):
        if src[j] == '{':
            p += 1
        elif src[j] == '}':
            p -= 1
            if not p:
                return src[i:j + 1]
    return src[i:]


# ═══════════════════════════════════════════════════════════════════════════════════════
# I. MESURES — chaque chiffre de ce document est RECOMPTE ici depuis le code servi
# ═══════════════════════════════════════════════════════════════════════════════════════
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, ''])[1]
g(re.match(r'^ft-v\d+$', VERSION), 'la version servie n a pas pu etre lue dans sw.js')

SB = sans_commentaires(lire('supabase.js'))
g('p_email: email' in SB,
  'le client n envoie plus un p_email libre : V2 serait fermee, ce document dit le contraire')

W = lire('worker.js')
WC = sans_commentaires(W)
CO = sans_commentaires(lire('constants.js'))
CJ = sans_commentaires(lire('Code.js'))

# ── la route et sa POSITION (c'est une position qui est mesuree, pas une presence) ──────
I_ROUTE = WC.find("body.action === 'cloudSave'")
I_RELAIS = WC.find('APPS_SCRIPT_URL,', WC.find('const up = await fetch('))
I_IA = WC.find('_ACTIONS_IA.has(body.action)')
g(I_ROUTE > 0, 'la route cloudSave a disparu du Worker')
g(0 < I_ROUTE < I_RELAIS, 'la route passe desormais APRES le relais attrape-tout')
g(0 < I_ROUTE < I_IA, 'la route passe desormais APRES le bloc des actions IA')

# ── les branches de refus : d ou peut venir une « raison » ──────────────────────────────
CS = corps_fn(WC, 'cloudSave')
g("raison: 'forme'" in CS, 'la branche « forme » a disparu : la lecture du 401 changerait')
g('raison: moi.raison' in CS, 'le 401 ne relaie plus la raison du pont')
g("raison: 'revoque'" in CS, 'la branche « revoque » a disparu')
# ⭐⭐ LA GARDE QUI PORTE TOUTE LA LECTURE DU DOCUMENT. Si « inconnu » devenait une chaine
#     litterale du Worker, la raison observee ne designerait plus le pont de facon unique.
g("'inconnu'" not in WC,
  '« inconnu » est devenu une chaine du Worker : la raison observee ne designe plus le pont')

SBA = corps_fn(WC, '_sbAppel')
g("if (!base || !cle) return { ok: false, statut: 0, raison: 'config' }" in SBA,
  'la branche « config » a disparu : un refus ne prouverait plus que les secrets sont vus')
g("r.status >= 500 ? 'panne' : 'refus'" in SBA,
  'la distinction panne / refus a disparu : un 5xx redeviendrait un refus d identite')
g("catch (e) {\n    return { ok: false, statut: 0, raison: 'reseau' };" in SBA,
  'la branche « reseau » a disparu : un cloud injoignable ne serait plus distingue')

# ── le pont, cote Apps Script : qui ecrit « inconnu », et quand ────────────────────────
JI = corps_fn(CJ, '_jetonIdentite_')
g("if (b.length !== 64) return { ok: false, raison: 'absent' }" in JI,
  'le pont ne controle plus la longueur : « absent » et « inconnu » se confondraient')
g("if (!raw) return { ok: false, raison: 'inconnu' }" in JI,
  'le pont n ecrit plus « inconnu » quand le jeton est absent du registre')
g('_JET_PREFIXE_ + _sha256hex_(b)' in JI,
  'le pont ne cherche plus le HACHE du jeton : il lirait autre chose que ce que le document dit')
g("body.action === 'authIdentity'" in CJ, 'la route authIdentity a disparu de Code.js')

# ── ce qui rendait l essai sur : l injecteur n ecrase jamais un jeton fourni ────────────
g(re.search(r'&&\s*!o\.token\s*\)', CO) is not None,
  'l injecteur ecrase desormais un jeton fourni : l essai aurait envoye le VRAI jeton')
_hu = re.search(r"AI_PROXY_URL\s*=\s*'https://([a-z0-9.\-]+)'", CO)
g(_hu is not None, 'l URL du Worker est introuvable dans constants.js')
HOTE = _hu.group(1)
_ao = re.search(r"ALLOWED_ORIGIN\s*=\s*'([^']+)'", WC)
g(_ao is not None, 'le filtre d origine a disparu du Worker')
ORIGINE = _ao.group(1)

# ── LE RELEVE : lu dans son journal, jamais de memoire ──────────────────────────────────
g(os.path.exists(LOG), 'le journal de mesure est introuvable : rien a publier')
J = open(LOG, encoding='utf-8', errors='replace').read()
_st = re.search(r'STATUT (\d{3}) \| (\{.*\})', J)
g(_st is not None, 'le journal ne porte pas de ligne « STATUT <code> | <corps> »')
CODE_HTTP, CORPS = _st.group(1), _st.group(2)
g(CODE_HTTP == '401', 'le code releve n est pas 401 : toute la lecture de ce document tombe')
g('"error":"auth"' in CORPS, 'le corps releve n annonce pas un refus d identite')
_rs = re.search(r'"raison":"([a-z]+)"', CORPS)
g(_rs is not None and _rs.group(1) == 'inconnu',
  'la raison relevee n est pas « inconnu » : ce document en tire sa conclusion')
RAISON = _rs.group(1)
g(HOTE in J, 'le journal ne porte pas le meme hote que constants.js')
# ⛔ AUCUN VRAI JETON DANS LE JOURNAL. Un 64-hexadecimal qui ne serait pas les 64 zeros
#    serait un secret publie — exactement ce que la consigne interdit.
for _t in re.findall(r'\b[0-9a-f]{64}\b', J):
    g(_t == '0' * 64, 'le journal contient un jeton de 64 hexadecimaux qui n est pas le factice')
g("'0'.repeat(64)" in J or '0' * 64 in J, 'le journal ne dit pas quel jeton a ete employe')
# ⚠️ GARDE RESSERREE APRES UNE MUTATION QUI L A LAISSEE VERTE — meme faiblesse que celles
#    deja payees quatre fois : elle cherchait « aucune » et « ecriture » N IMPORTE OU dans le
#    journal. Or « aucune adresse » et la ligne « Ecriture : ... » vivent ailleurs : remplacer
#    la garantie par « Ecriture : sans objet » la laissait parfaitement verte.
#    *Deux mots presents quelque part ne font pas une phrase.* On lit LA ligne.
g(re.search(r'(?im)^\s*Ecriture\s*:\s*aucune\b', J) is not None,
  'le journal ne dit plus, sur SA ligne, qu aucune ecriture n a eu lieu')

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


PROUVE = '<font color="#1E7A46"><b>PROUVE</b></font>'
NON_PROUVE = '<font color="#B26A00"><b>NON PROUVE</b></font>'

# ═══════════════════════════════════════════════════════════════════════════════════════
# II. LE DOCUMENT
# ═══════════════════════════════════════════════════════════════════════════════════════
H = []
# @@DEBUT@@
H.append(P('S2-B - la nouvelle route de sauvegarde, mesuree en reseau reel', 'titre'))
H.append(P('Force Tracker - 18 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>aucune modification de code, aucun bouton ajoute, '
           'V2 toujours ouverte</b>', 'sous'))

H.append(encadre(
    'CE QUI A ETE FAIT, EN UNE PHRASE',
    'Michel a execute <b>une seule requete</b> depuis la console de son navigateur, sur le '
    'vrai site, avec un <b>jeton factice</b> (64 zeros) et une charge vide. Aucune ligne de '
    'code n a ete ajoutee, aucun bouton n a ete cree, et <b>aucun vrai jeton n a circule</b> '
    '- l injecteur de <font face="Courier">constants.js</font> n ecrase jamais un jeton deja '
    'pose, ce qui est verifie par une garde de ce generateur.'))

H.append(P('1. Le releve brut', 'h1'))
H.append(P('Recopie mot pour mot de la console, et relu ici depuis son journal - jamais de '
           'memoire :', 'p'))
H.append(bloc_code(
    'POST https://' + HOTE + '/  ' + CODE_HTTP + ' (Unauthorized)\n'
    'STATUT ' + CODE_HTTP + ' | ' + CORPS))

H.append(P('2. Ce que cette seule ligne prouve, etape par etape', 'h1'))
H.append(P('Chaque ligne du tableau est une deduction du <b>code servi</b>, pas une '
           'impression : si une autre etape avait echoue, la reponse aurait ete '
           '<i>differente</i>, et c est cela qui se lit.', 'p'))
H.append(tableau(
    ['etape', 'ce qu on en sait', 'pourquoi'],
    [['filtre d origine', PROUVE,
      'une origine refusee rend <b>403</b> et <b>sans en-tetes CORS</b> - le navigateur '
      'n aurait meme pas pu lire le corps. Origine attendue : '
      '<font face="Courier">' + ORIGINE + '</font>'],
     ['la route <font face="Courier">cloudSave</font> est atteinte', PROUVE,
      'elle est traitee <b>avant</b> le relais attrape-tout (position ' + str(I_ROUTE) +
      ' contre ' + str(I_RELAIS) + ') et <b>avant</b> le bloc des actions IA (' + str(I_IA) +
      ') : une requete tombee dans le relais aurait recu la reponse d Apps Script, pas '
      'celle-ci'],
     ['la forme du jeton est acceptee', PROUVE,
      'un jeton mal forme rend <font face="Courier">raison:"forme"</font>. Les 64 zeros sont '
      'bien passes le controle'],
     ['la charge est acceptee', PROUVE,
      'une charge non conforme rend <b>400</b>, pas 401'],
     ['le hachage a tourne', PROUVE,
      '<font face="Courier">crypto.subtle</font> est operationnel cote Cloudflare, sinon '
      'l appel serait mort avant'],
     ['<b>les secrets Cloudflare sont vus par le Worker</b>', PROUVE,
      'c est le point le plus fort, et il se deduit : une configuration absente rend '
      '<b>503</b> avec <font face="Courier">raison:"config"</font>, un cloud injoignable rend '
      '<b>503</b> avec <font face="Courier">"reseau"</font>. On a recu <b>401</b> : donc '
      'l URL et la cle etaient la, <b>et quelque chose a repondu</b>'],
     ['le pont Apps Script a repondu', PROUVE,
      '<font face="Courier">raison:"' + RAISON + '"</font> ne peut venir que de lui : ce mot '
      'n existe nulle part dans le Worker, il est ecrit par '
      '<font face="Courier">_jetonIdentite_</font> quand le hache n est pas dans le registre'],
     ['la porte reste fermee', PROUVE,
      '401, et <b>aucune ecriture</b> : le refus tombe avant toute tentative d enregistrement']],
    [38 * mm, 26 * mm, 102 * mm]))

H.append(encadre(
    'LE RESULTAT EST EXACTEMENT CELUI QU UN JETON INVENTE DOIT PRODUIRE',
    'Un jeton de 64 zeros n existe ni dans Supabase ni dans le registre Apps Script. La '
    'chaine complete a donc ete parcourue, chaque maillon a fait son travail, et la reponse '
    'est un refus <b>motive</b> - pas une panne, pas un silence, pas un passage en force.',
    VERT))

H.append(P('3. La limite honnete, dite plutot que masquee', 'h1'))
H.append(encadre(
    'CE QUE CETTE MESURE NE DISTINGUE PAS',
    '<font face="Courier">_sbAppel</font> traduit <b>tout code 4xx</b> en '
    '<font face="Courier">"refus"</font>. La mesure prouve donc que quelque chose a repondu '
    '<b>4xx</b> a l adresse Supabase - elle ne separe pas <i>« la fonction a correctement '
    'refuse un hache inconnu »</i> de <i>« une erreur 404 sur un nom de fonction faux »</i>. '
    'La verification de la phase 1, faite dans la vraie base, a montre que les trois '
    'fonctions existent : la premiere lecture est de tres loin la plus probable, mais '
    '<b>cette requete-ci ne les separe pas</b>. Ce qui trancherait : la premiere sauvegarde '
    'avec un <b>vrai</b> jeton, qui doit revenir '
    '<font face="Courier">voie:"pont"</font> puis, la fois suivante, '
    '<font face="Courier">voie:"directe"</font>.', ORANGE))

H.append(P('4. Ce qui reste non prouve', 'h1'))
H.append(tableau(
    ['', '', ''],
    [['le chemin du <b>succes</b> (code 200)', NON_PROUVE,
      'il demande un <b>vrai</b> jeton, donc la bascule du client - et un vrai jeton ne se '
      'colle jamais dans une conversation, un PDF ou un journal'],
     ['l inscription d un jeton par le pont', NON_PROUVE,
      'meme raison : elle n a lieu qu apres une identite reconnue'],
     ['la fermeture de V2', NON_PROUVE,
      'rien n a ete bascule. Le client appelle <b>toujours</b> l ancienne fonction avec une '
      'adresse - mesure a l instant dans <font face="Courier">supabase.js</font>']],
    [52 * mm, 26 * mm, 88 * mm]))

H.append(P('5. La decision qui appartient a Michel', 'h1'))
H.append(P('La route est <b>atteignable, correctement cablee et fermee par defaut</b>. La '
           'suite logique est la phase 4 - faire appeler cette route par l application a la '
           'place de l ancienne - mais c est une <b>bascule de production</b>, donc une '
           'decision, pas une consequence automatique de cette mesure.', 'p'))
H.append(P('Rien ne sera bascule sans accord explicite. Tant que l accord n est pas donne, '
           'l ancienne porte reste ouverte et le nouveau chemin reste dormant : il n a '
           'aucun appelant.', 'petit'))

H.append(P('6. Ce qui n a pas bouge', 'h1'))
H.append(P('Aucun fichier n a ete modifie pour cette mesure - ni servi, ni de test, ni de '
           'configuration. Le banc S2-B reste vert, le filtre d origine est intact, le relais '
           'vers Apps Script est intact, et les actions IA n ont pas ete touchees. Nutrition, '
           'Milo, Seance, Progres : zero ligne.', 'petit'))
# @@FIN@@

_bt = ' '.join(TEXTES).lower()
_rendu = (_bt + ' ' + ' '.join(CODES)).lower()

# ── gardes de FOND : le document ne doit pas affirmer plus que la mesure ────────────────
for _mot, _msg in [
        ('v2 est fermee', 'le document annonce une fermeture qui n a pas eu lieu'),
        ('v2 est desormais fermee', 'idem'),
        ('le chemin du succes est prouve', 'le document affirme ce que la mesure ne montre pas'),
        ('une ecriture a eu lieu', 'aucune ecriture n a eu lieu'),
        ('le vrai jeton', 'le document laisse croire qu un vrai jeton a circule')]:
    g(_mot not in _bt, _msg)

for _mot, _pourquoi in (
        ('jeton factice', 'c est ce qui rend la mesure sans danger'),
        ('aucune ecriture', 'c est la garantie centrale de l essai'),
        ('ne separe pas', 'la limite honnete doit rester dans le document'),
        ('non prouve', 'ce qui manque doit etre nomme, pas seulement ce qui marche'),
        ('appartient a michel', 'la bascule est une decision, pas une consequence')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))

# ⭐ le releve cite dans le document doit etre celui du journal, caractere pour caractere
g(CORPS in ' '.join(CODES), 'le corps cite dans le document n est pas celui du journal')

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-B - mesure en reseau reel', author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, %s/%s, hote %s, V2 ouverte)'
      % (OUT, VERSION, GARDES[0], CODE_HTTP, RAISON, HOTE))
