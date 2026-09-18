#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B PHASE 4 — L'ESSAI SUR IPHONE REEL : ce qui est prouve, et les deux defauts trouves.

[!!] LE RELEVE SE LIT DANS SON JOURNAL, JAMAIS DE MEMOIRE (lecon ft-v1201). Le generateur
     refuse de produire si la ligne de la sonde manque, si l'horodatage de l'echec manque, ou
     si le journal cessait de dire que les deux voies ne sont PAS encore observees.

[!!] ⭐⭐ ET IL PORTE UNE GARDE A L'ENVERS, QUI EST LA PLUS IMPORTANTE DU FICHIER : il REFUSE
     de produire si les deux defauts decrits ont ete CORRIGES entre-temps. Un dossier qui
     decrit un defaut deja repare est pire qu'un dossier absent — il fait chercher quelque
     chose qui n'existe plus. C'est le miroir exact des gardes habituelles : d'ordinaire on
     verifie qu'une correction est bien la, ici on verifie qu'elle ne l'est PAS ENCORE.

[!!] ⛔⛔ CE GENERATEUR NE PRODUIT PLUS RIEN DEPUIS ft-v1223, ET C'EST VOULU — NE PAS LE
     « REPARER ». Ses gardes a l'envers refusent de publier un dossier qui decrit un defaut
     DEJA CORRIGE. Les deux defauts d'affichage (une panne dite « identite refusee », et la
     carte qui promettait une ecriture) ont ete corriges le 18/09/2026 sur feu vert de Michel.
     Le PDF qu'il a produit est date et deja livre : son role est fini. Rendre ce fichier
     capable de produire a nouveau reviendrait a remettre le defaut dans le code (R30).

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
    SCRATCH, 'S2B-ESSAI-IPHONE-REEL-18-09-2026.pdf')
LOG = os.environ.get('FT_LOG') or os.path.join(SCRATCH, 'essai_iphone_1222.log')

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


# ═══════════════════════════════════════════════════════════════════════════════════════
# I. MESURES
# ═══════════════════════════════════════════════════════════════════════════════════════
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, ''])[1]
g(re.match(r'^ft-v\d+$', VERSION), 'la version servie n a pas pu etre lue dans sw.js')

SB = sans_commentaires(lire('supabase.js'))
W = sans_commentaires(lire('worker.js'))
CO = sans_commentaires(lire('constants.js'))
HTM = lire('index.html')

ETAT = corps_fn(SB, '_sbEtatDepuis')
SONDE = corps_fn(SB, 'sbTestVoie')
ENV = corps_fn(SB, 'sbEnvoyer')
PONT = corps_fn(W, '_identiteIA')
CS = corps_fn(W, 'cloudSave')

# ── LA CHAINE QUI PRODUIT LE MOT OBSERVE ────────────────────────────────────────────────
g("catch (e) { return { ok: false, raison: 'reseau' }; }" in PONT,
  'le pont ne rend plus « reseau » quand il n atteint pas Apps Script')
g('raison: moi.raison' in CS,
  'la route ne relaie plus la raison du pont : le mot observe ne viendrait plus de la')
g("statut: 401, corps: { status: 'error', error: 'auth', raison: moi.raison }" in CS,
  'le refus du pont n est plus rendu en 401')

# ── ⭐⭐ GARDE A L'ENVERS N°1 : LE DEFAUT D'AFFICHAGE EST-IL TOUJOURS LA ? ───────────────
#    On verifie que la branche 401 ne traite a part QUE « revoque » et « forme » — donc que
#    « reseau » tombe encore dans le fourre-tout « identite refusee ». Si ce n'etait plus
#    vrai, ce dossier decrirait un defaut deja corrige.
_b401 = ETAT[ETAT.find('statut === 401'):]
_cas = re.findall(r"if \(r === '([a-z]+)'\)", _b401)
g(_cas == ['revoque', 'forme'],
  'la branche 401 ne traite plus exactement « revoque » puis « forme » (%s) : le defaut '
  'decrit par ce dossier a change, il ne doit pas etre publie tel quel' % _cas)
g("'identité refusée (' + r + ')'" in _b401,
  'le fourre-tout « identite refusee » a disparu : le defaut decrit est deja corrige')
g("'reseau'" not in _b401,
  '« reseau » est desormais traite a part dans la branche 401 : le defaut est corrige, '
  'ce dossier est perime')

# ── ⭐⭐ GARDE A L'ENVERS N°2 : LE TEXTE DE LA CARTE PROMET-IL TOUJOURS UNE ECRITURE ? ───
PROMESSE = 'Le bouton écrit une ligne de test <strong>pour de vrai</strong>'
g(PROMESSE in HTM,
  'le texte de la carte ne promet plus une ecriture : le second defaut est corrige, '
  'ce dossier est perime')
g('sbTestVoie' in HTM or True, '')  # (la carte appelle loadSbAdmin, pas la sonde directement)

# ── ce qui reste vrai et doit le rester ────────────────────────────────────────────────
g('token:SB_SONDE_JETON' in SONDE, 'la sonde ne pose plus son jeton factice')
g(re.search(r"SB_SONDE_JETON\s*=\s*'0{64}'", SB) is not None,
  'le jeton de la sonde n est plus 64 zeros')
g(re.search(r'&&\s*!o\.token\s*\)', CO) is not None,
  'l injecteur ecrase desormais un jeton fourni : la sonde deviendrait une vraie sauvegarde')
g('_ftToken' not in ENV, 'la porte lit le jeton : R2 rompu')
g('p_email: email' in SB,
  'V2 serait fermee : ce dossier decrit un etat intermediaire')
g("SB_VOIE = 'worker'" in SB, 'la voie par defaut n est plus celle du jeton')
g('cloud indisponible' in ETAT, 'la branche 503 a disparu')

# ── LE RELEVE : lu dans son journal ────────────────────────────────────────────────────
g(os.path.exists(LOG), 'le journal de l essai est introuvable : rien a publier')
J = open(LOG, encoding='utf-8', errors='replace').read()
g('REFUSE un jeton inconnu' in J and 'HTTP 401' in J,
  'le journal ne porte plus la ligne de la sonde')
g('jeton present sur cet appareil' in J,
  'le journal ne dit plus que le jeton est present : tout le reste en depend')
_h = re.search(r'identite refusee \(reseau\)\) : (\d\d/\d\d/\d{4} \d\d:\d\d:\d\d)', J)
g(_h is not None, 'le journal ne porte plus l horodatage de l echec')
QUAND = _h.group(1)
g(re.search(r'(?im)^voie:pont\s*:\s*PAS ENCORE OBSERVEE', J) is not None,
  'le journal ne dit plus, sur SA ligne, que la voie « pont » n est pas encore observee')
g(re.search(r'(?im)^voie:directe\s*:\s*PAS ENCORE OBSERVEE', J) is not None,
  'le journal ne dit plus, sur SA ligne, que la voie « directe » n est pas encore observee')
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


PROUVE = '<font color="#1E7A46"><b>PROUVE</b></font>'
ATTENTE = '<font color="#B26A00"><b>PAS ENCORE</b></font>'

# ═══════════════════════════════════════════════════════════════════════════════════════
# II. LE DOCUMENT
# ═══════════════════════════════════════════════════════════════════════════════════════
H = []
# @@DEBUT@@
H.append(P('S2-B phase 4 - l essai sur iPhone reel', 'titre'))
H.append(P('Force Tracker - 18 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>V2 n est PAS fermee</b>', 'sous'))

H.append(encadre(
    'EN UNE PHRASE',
    'La nouvelle route fonctionne de bout en bout depuis le telephone de Michel, et son jeton '
    'est bien present. Mais la vraie sauvegarde de <b>' + QUAND + '</b> a echoue <b>au pont '
    'Apps Script</b> - et mon ecran a presente cette panne comme un <b>refus d identite</b>, '
    'ce qui est faux.'))

H.append(P('1. Ce que l ecran a rendu', 'h1'))
H.append(bloc_code(
    "Profil > Admin > carte « Copie miroir Supabase », bouton « Tester la copie miroir »\n"
    "\n"
    "  La route repond et REFUSE un jeton inconnu (HTTP 401, raison « inconnu »).\n"
    "  Aucune ecriture.\n"
    "  voie : jeton resolu cote serveur - jeton present sur cet appareil\n"
    "  Derniere tentative en echec (identite refusee (reseau)) : " + QUAND))

H.append(P('2. Ce que cela prouve', 'h1'))
H.append(tableau(
    ['', '', ''],
    [['la route est atteinte depuis le telephone', PROUVE,
      'origine acceptee, Worker configure, Supabase joignable'],
     ['le pont Apps Script repond', PROUVE,
      'le mot <b>inconnu</b> ne peut venir que de lui : il n existe nulle part dans le Worker'],
     ['la sonde n ecrit rien', PROUVE, 'refus sur un jeton factice de 64 zeros'],
     ['un jeton S1 existe sur l appareil', PROUVE, 'le prerequis de toute la bascule'],
     ['<b>voie : pont</b> (1re vraie sauvegarde)', ATTENTE, 'la tentative de ' + QUAND + ' a echoue avant'],
     ['<b>voie : directe</b> (2e vraie sauvegarde)', ATTENTE, 'elle depend de la precedente']],
    [56 * mm, 24 * mm, 86 * mm]))

H.append(P('3. Ce qui a echoue, et ou exactement', 'h1'))
H.append(P('Le mot <font face="Courier">reseau</font> a une seule origine dans tout le code : '
           'le <b>pont</b>, quand il n arrive pas a joindre Apps Script. La sauvegarde est '
           'donc allee jusqu au bout du chemin - Supabase a refuse le hache (normal la '
           'premiere fois), le Worker s est tourne vers Google, et Google n a pas repondu.', 'p'))
H.append(bloc_code(
    "worker.js, _identiteIA :\n"
    "  catch (e) { return { ok: false, raison: 'reseau' }; }\n"
    "\n"
    "worker.js, cloudSave :\n"
    "  if (!moi.ok) return { statut: 401, corps: { ..., raison: moi.raison } };"))
H.append(P('Ce n est donc <b>ni le compte, ni le jeton</b>. Le miroir n a simplement pas ecrit '
           'cette fois-la. Apps Script, lui, a recu la sauvegarde comme d habitude : il reste '
           'la source de verite, rien n est perdu.', 'petit'))

H.append(P('4. Le premier defaut : il est a moi, et c est celui que je denonce', 'h1'))
H.append(encadre(
    'UNE PANNE AFFICHEE COMME UN REFUS D IDENTITE',
    'La branche 401 ne traite a part que <font face="Courier">revoque</font> et '
    '<font face="Courier">forme</font> ; tout le reste tombe dans un fourre-tout qui dit '
    '<b>« identite refusee »</b>. Or <font face="Courier">reseau</font> est une <b>panne</b>. '
    'Le chantier entier repose sur la phrase <i>« dire a quelqu un que son appareil est '
    'revoque alors que le cloud est tombe est une erreur qu il va essayer de reparer '
    'lui-meme »</i> - et je viens de faire exactement ca, un cran plus bas.', ORANGE))
H.append(P('<b>Et mon banc ne l a pas vu, parce que le cas n y etait pas.</b> J ai conduit '
           '401/revoque, 401/sans-jeton, 503, et la coupure reseau <b>du telephone</b>. Pas le '
           '<b>401 dont la raison est une panne du PONT</b>. <i>Un cas qu on n ecrit pas reste '
           'vert pour toujours</i> - c est la meme famille que les trous deja payes sur ce '
           'chantier, et celui-la a ete trouve par un vrai telephone, pas par une relecture.', 'p'))

H.append(P('5. Le second defaut : la carte promet une ecriture qui n a plus lieu', 'h1'))
H.append(P('Le texte sous le titre dit encore : <i>« Le bouton ecrit une ligne de test <b>pour '
           'de vrai</b> et dit ce qui cloche si ca rate. »</i> C etait vrai de l ancien bouton '
           '(qui ecrivait via l ancien RPC). Le nouveau <b>n ecrit rien</b> - et c est '
           'precisement ce qui le rend sur pendant la mesure. J ai change le comportement sans '
           'changer le texte qui le decrit : <b>R23</b>, la documentation posee a cote du code '
           'qui se met a mentir.', 'p'))

H.append(P('6. Ce qui est demande a Michel, et rien d autre', 'h1'))
H.append(bloc_code(
    "1. modifier n'importe quoi dans le profil (cela declenche une sauvegarde)\n"
    "2. rouvrir Profil > Admin et rappuyer sur « Tester la copie miroir »\n"
    "\n"
    "   -> « ecrit (voie : pont) »   = le pont repondait, on continue le protocole\n"
    "   -> « reseau » a nouveau      = le pont a un vrai probleme, on creuse avant la suite\n"
    "\n"
    "3. dire si Milo repond normalement : il passe par LE MEME pont.\n"
    "   s'il repond, le pont est joignable et l'echec etait transitoire."))

H.append(P('7. Les deux corrections en attente d accord', 'h1'))
H.append(tableau(
    ['correction', 'ce qu elle change', 'portee'],
    [['une panne cesse d etre annoncee comme un refus d identite',
      '<font face="Courier">reseau</font> et les autres pannes du pont sont dites comme telles',
      '<font face="Courier">supabase.js</font>, une branche'],
     ['le texte de la carte cesse de promettre une ecriture',
      'la phrase decrit ce que le bouton fait vraiment',
      '<font face="Courier">index.html</font>, deux lignes']],
    [58 * mm, 66 * mm, 42 * mm]))
H.append(P('<b>Aucune des deux n est faite.</b> Ce sont des changements de fichiers servis, donc '
           'une version - et rien ne se code sans accord (regles d or #15 et #16).', 'petit'))

H.append(P('8. Ce qui n a pas bouge', 'h1'))
H.append(P('<b>V2 reste ouverte</b> : l ancien RPC n est pas revoque, l ancienne porte garde son '
           'adresse libre, et le temoin qui le constate reste volontairement non retourne. '
           'Nutrition, scanner, douane, journal alimentaire, Accueil, Seance, Progres, Milo : '
           'zero ligne. La sonde continue de poser son jeton factice, et l injecteur continue '
           'de ne jamais ecraser un jeton deja pose - les deux verrous qui empechent la sonde '
           'd ecraser un vrai instantane.', 'p'))
# @@FIN@@

_bt = ' '.join(TEXTES).lower()
_rendu = (_bt + ' ' + ' '.join(CODES)).lower()

for _mot, _msg in [
        ('v2 est fermee', 'le document annonce une fermeture qui n a pas eu lieu'),
        ('la bascule est validee', 'les deux voies ne sont pas encore observees'),
        ('voie pont observee', 'elle ne l est pas'),
        ('defaut corrige', 'aucune des deux corrections n est faite')]:
    g(_mot not in _bt, _msg)

for _mot, _pourquoi in (
        ('n ecrit rien', 'c est ce qui rend la sonde sure'),
        ('pas encore', 'ce qui manque doit etre nomme'),
        ('le pont', 'c est la ou l echec s est produit'),
        ('a moi', 'le defaut d affichage est le mien, et ca se dit'),
        ('reste vert pour toujours', 'la lecon du trou de banc'),
        ('aucune des deux n est faite', 'rien n a ete code sans accord')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))

g(QUAND in _rendu, 'l horodatage de l echec n est plus cite dans le document')
g('voie : pont' in _rendu and 'voie : directe' in _rendu,
  'le document ne nomme plus les deux voies attendues')

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-B phase 4 - essai iPhone reel', author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, echec a %s, 2 defauts NON corriges, V2 ouverte)'
      % (OUT, VERSION, GARDES[0], QUAND))
