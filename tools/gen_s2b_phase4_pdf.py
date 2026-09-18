#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B PHASE 4 — LA BASCULE DU CLIENT VERS `cloudSave` : dossier de preuve.

[!!] LES TOTAUX SE LISENT DANS LEUR JOURNAL, JAMAIS DE MEMOIRE (lecon ft-v1201, ou un PDF a
     publie un total pendant que la passe tournait encore). Les trois chiffres — passe
     complete, banc de la bascule, mutations — sont EXTRAITS de leurs fichiers de sortie, et
     le generateur refuse de produire si une ligne de total manque, si le runner n'a pas
     fini, ou si un total annonce un rouge.

[!!] IL REFUSE AUSSI DE PRODUIRE :
     - si V2 n'est plus ouverte (`p_email` libre dans l'ancienne porte) — ce dossier decrit un
       etat intermediaire, et un dossier qui decrit un etat qu'il n'a pas verifie se perime en
       silence ;
     - si la sonde Admin ne POSE plus son jeton factice, ou si l'injecteur se met a ecraser un
       jeton fourni : ce document affirme que la sonde n'ecrit rien, et ces deux conditions
       sont exactement ce qui le rend vrai ;
     - si `sbMirror` avait disparu (le retour arriere annonce n'existerait plus).

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
    SCRATCH, 'S2B-PHASE4-BASCULE-CLOUDSAVE-18-09-2026.pdf')
LOG_PASSE = os.environ.get('FT_LOG_PASSE') or '/tmp/passe1222.log'
LOG_BANC = os.environ.get('FT_LOG_BANC') or '/tmp/banc_bascule.log'
LOG_MUT = os.environ.get('FT_LOG_MUT') or '/tmp/mut_bascule.log'

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires(src):
    """Retire les commentaires JS, GARDE les chaines. Sans ca on mesurerait la documentation
    du fichier au lieu de son code — famille de defauts payee cinq fois sur ce chantier."""
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
# I. MESURES — recomptees depuis le code SERVI
# ═══════════════════════════════════════════════════════════════════════════════════════
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, ''])[1]
g(re.match(r'^ft-v\d+$', VERSION), 'la version servie n a pas pu etre lue dans sw.js')

SB = lire('supabase.js'); SBC = sans_commentaires(SB)
SET = sans_commentaires(lire('setup.js'))
APP = sans_commentaires(lire('app.js'))
CO = sans_commentaires(lire('constants.js'))

ENV = corps_fn(SBC, 'sbEnvoyer')
SONDE = corps_fn(SBC, 'sbTestVoie')
MIR = corps_fn(SBC, 'sbMirror')
ETAT = corps_fn(SBC, '_sbEtatDepuis')
CS = corps_fn(SET, '_cloudSync')
ADMIN = corps_fn(APP, 'loadSbAdmin')

# ── la bascule ──────────────────────────────────────────────────────────────────────────
g('sbEnvoyer(_corpsSync)' in CS, 'le client n appelle plus la nouvelle porte')
g('sbMirror(' not in CS, 'le client appelle encore l ancienne porte')
g("SB_VOIE = 'worker'" in SBC, 'la voie par defaut n est plus celle du jeton')

# ── V2 EST OUVERTE : ce dossier decrit un etat intermediaire ────────────────────────────
g('p_email: email' in MIR,
  'l ancienne porte n envoie plus d adresse : V2 serait fermee, ce dossier dit le contraire')
g('function sbMirror(' in SBC and 'function sbTest(' in SBC,
  'l ancienne porte a disparu : le retour arriere annonce n existe plus')

# ── la sonde : les deux verrous qui la rendent inoffensive ──────────────────────────────
g('token:SB_SONDE_JETON' in SONDE,
  'la sonde ne POSE plus son jeton factice : elle emporterait le VRAI et ecrirait')
g(re.search(r"SB_SONDE_JETON\s*=\s*'0{64}'", SBC) is not None,
  'le jeton de la sonde n est plus 64 zeros')
g(re.search(r'&&\s*!o\.token\s*\)', CO) is not None,
  'l injecteur ecrase desormais un jeton fourni : la sonde deviendrait une vraie sauvegarde')
g('_ftToken' not in SONDE, 'la sonde lit le vrai jeton')

# ── ce que la nouvelle porte ne fait pas ────────────────────────────────────────────────
g('p_email' not in ENV, 'une adresse redevient un selecteur sur la nouvelle voie')
g('_ftToken' not in ENV, 'la nouvelle porte lit le jeton : R2 rompu, deux lecteurs')
g('_sbSansJustificatifs(payload)' in ENV, 'le filet des justificatifs a saute')
g('console.' not in ENV and 'console.' not in SONDE, 'la nouvelle porte journalise')
g('rest/v1' not in ENV and 'SB_URL' not in ENV, 'la nouvelle porte vise Supabase en direct')

# ── panne contre revocation ─────────────────────────────────────────────────────────────
_b503 = (re.search(r'statut === 503[^\n]*', ETAT) or [''])[0]
g('cloud indisponible' in _b503 and 'voqu' not in _b503,
  'une panne du cloud est presentee comme une revocation')
g("statut === 200 && d && d.status === 'ok'" in ETAT,
  'un succes est reconnu sur le seul code HTTP')

# ── la carte Admin ne reveille plus l ancienne voie ─────────────────────────────────────
g('sbTestVoie()' in ADMIN, 'la carte n eprouve plus la nouvelle route')
g(re.search(r'\bsbTest\(\)', APP) is None,
  'un appel a l ancien test subsiste dans app.js : la mesure serait polluee')

# ── perimetre ───────────────────────────────────────────────────────────────────────────
g('function _douaneLigne(' in APP and 'function scanBarcode(' in APP,
  'Nutrition a bouge : hors perimetre')
g(len(re.findall(r'sbTestVoie', APP)) == len(re.findall(r'sbTestVoie', ADMIN)),
  'mon empreinte dans app.js deborde de la carte Admin')
g(len(re.findall(r'_ftToken\(\)', CS)) == 1 and len(re.findall(r'_authCode\(\)', CS)) == 1,
  'un justificatif est lu deux fois dans _cloudSync (alias)')


def total(chemin, motif, quoi):
    g(os.path.exists(chemin), 'le journal %s est introuvable : rien a publier' % quoi)
    txt = open(chemin, encoding='utf-8', errors='replace').read()
    m = re.search(motif, txt)
    g(m is not None, 'le journal %s ne porte pas sa ligne de total (passe inachevee ?)' % quoi)
    return m


# ⭐ LA PASSE : sa ligne de total DOIT exister, et le runner DOIT avoir fini.
_p = total(LOG_PASSE, r'TOTAL CROISÉ : (\d+) ✅ · (\d+) ❌', 'de la passe')
PASSE_OK, PASSE_KO = _p.group(1), _p.group(2)
g(PASSE_KO == '0', 'la passe complete porte %s rouge(s) : rien ne se publie' % PASSE_KO)
g(re.search(r'RC=0', open(LOG_PASSE, encoding='utf-8', errors='replace').read()) is not None,
  'le runner lui-meme n a pas fini proprement (un total tronque ressemble a un total vert)')

_b = total(LOG_BANC, r'(\d+) OK / (\d+) rouge', 'du banc de la bascule')
BANC_OK, BANC_KO = _b.group(1), _b.group(2)
g(BANC_KO == '0', 'le banc de la bascule porte %s rouge(s)' % BANC_KO)

_m = total(LOG_MUT, r'(\d+)/(\d+) conformes', 'des mutations')
MUT_OK, MUT_TOT = _m.group(1), _m.group(2)
g(MUT_OK == MUT_TOT, 'le controle negatif n est pas complet (%s/%s)' % (MUT_OK, MUT_TOT))
g(int(MUT_TOT) >= 20, 'le controle negatif est trop maigre (%s mutations)' % MUT_TOT)

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
ATTENTE = '<font color="#B26A00"><b>EN ATTENTE</b></font>'

# ═══════════════════════════════════════════════════════════════════════════════════════
# II. LE DOCUMENT
# ═══════════════════════════════════════════════════════════════════════════════════════
H = []
# @@DEBUT@@
H.append(P('S2-B phase 4 - le client bascule vers cloudSave', 'titre'))
H.append(P('Force Tracker - 18 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>V2 n est PAS fermee</b>', 'sous'))

H.append(encadre(
    'CE QUI CHANGE, EN UNE PHRASE',
    'L identite du compte ecrit dans le miroir Supabase ne vient plus d une <b>adresse envoyee '
    'par le navigateur</b> (<font face="Courier">p_email</font>, que n importe qui pouvait '
    'choisir) mais du <b>jeton S1 resolu cote serveur</b>. Le navigateur ne designe plus '
    'personne : il presente un justificatif, et c est le serveur qui dit a qui il appartient.'))

H.append(P('1. La bascule tient dans une ligne', 'h1'))
H.append(bloc_code(
    "setup.js, dans _cloudSync :\n"
    "  avant :  try{ if(typeof sbMirror==='function')sbMirror(_corpsSync); }catch(e){}\n"
    "  apres :  try{ if(typeof sbEnvoyer==='function')sbEnvoyer(_corpsSync); }catch(e){}"))
H.append(tableau(
    ['', 'avant', 'apres'],
    [['qui designe le compte ecrit', '<b>le navigateur</b> (adresse libre)',
      '<b>le serveur</b> (jeton hache, resolu dans Supabase)'],
     ['ce que le client envoie', 'adresse + instantane',
      'enveloppe + instantane ; le jeton est pose par l injecteur'],
     ['retour arriere', '-', '<b>une ligne</b> : <font face="Courier">SB_VOIE</font>'],
     ['appareil sans jeton', 'ecrivait quand meme',
      '<b>n ecrit plus</b> - et l etat le <b>dit</b>']],
    [42 * mm, 50 * mm, 74 * mm]))

H.append(P('2. Aucun repli automatique, et c est la decision centrale', 'h1'))
H.append(encadre(
    'POURQUOI ON NE RETOMBE PAS SUR L ADRESSE QUAND IL N Y A PAS DE JETON',
    'La tentation etait de garder l ancienne voie comme filet. Cela aurait rouvert V2 '
    '<b>exactement sur les comptes qu on cherche a proteger</b> - et <i>une porte derobee qui '
    'ne s ouvre qu en cas d echec est une porte qui s ouvre toujours au pire moment</i>. '
    'Rien n est perdu pour autant : <b>Apps Script reste la source de verite</b>, le miroir '
    'n est qu un filet. Et l etat l ecrit en clair plutot que de se taire - <i>c est justement '
    'en se taisant que la sauvegarde nocturne est restee morte 36 jours</i>.'))

H.append(P('3. La ligne la plus dangereuse du chantier, et ses deux verrous', 'h1'))
H.append(P('La carte Admin appelait <font face="Courier">sbTest()</font>, qui <b>ecrit</b> une '
           'ligne via l <b>ancien</b> RPC. L ouvrir pendant la mesure aurait emprunte le chemin '
           'qu on cherche justement a prouver inutilise : <i>un instrument qui modifie l etat '
           'qu il mesure ne mesure plus rien</i>. La sonde eprouve desormais la <b>nouvelle</b> '
           'route et <b>n ecrit rien</b>.', 'p'))
H.append(encadre(
    'SANS SON JETON FACTICE, LA SONDE ECRASERAIT L INSTANTANE DE LA PERSONNE',
    'La sonde <b>POSE</b> un jeton de 64 zeros. Si elle ne le posait pas, l injecteur de '
    '<font face="Courier">constants.js</font> y mettrait le <b>vrai</b> jeton : la sonde '
    'deviendrait une vraie sauvegarde et remplacerait l instantane par '
    '<font face="Courier">{sonde:true}</font>. <b>Deux verrous independants</b> : la sonde pose '
    'son jeton, et l injecteur n ecrase jamais un jeton deja pose. Deux temoins et deux '
    'mutations les figent des deux cotes, et ce generateur refuse de produire si l un des deux '
    'tombe.', ORANGE))
H.append(P('Et c est un <b>vrai test, pas un voyant</b> - la raison d etre de l ancien '
           '<font face="Courier">sbTest</font> vaut toujours : un <b>401 « inconnu »</b> prouve '
           'que la route est atteinte, l origine acceptee, la configuration vue, Supabase '
           'joignable et le pont tranchant. Un <b>200</b> sur jeton factice est une <b>alerte</b>, '
           'pas un succes.', 'petit'))

H.append(P('4. Une panne n est pas une revocation', 'h1'))
H.append(tableau(
    ['ce qui arrive', 'ce que l etat dit'],
    [['Supabase tombe ou mal configure (503)', '« cloud indisponible » - jamais « revoque »'],
     ['jeton revoque (401 / revoque)', '« appareil revoque - ecriture refusee »'],
     ['aucun jeton sur l appareil (401 / forme)', '« aucun jeton sur cet appareil »'],
     ['coupure reseau', '« reseau »']],
    [70 * mm, 96 * mm]))
H.append(P('<i>Dire « ton appareil est revoque » a quelqu un dont le cloud est simplement tombe '
           'est pire qu une erreur technique : c est une erreur qu il va essayer de reparer '
           'lui-meme.</i>', 'petit'))

H.append(P('5. Ce qui est prouve, et ce qui ne l est pas', 'h1'))
H.append(tableau(
    ['', '', ''],
    [['ce que le navigateur envoie', PROUVE,
      'banc de comportement : un seul appel, vers le Worker, jeton dans l <b>enveloppe</b> et '
      'jamais dans la donnee, aucun selecteur d identite, aucun appel direct a Supabase'],
     ['panne / revocation / reseau distingues', PROUVE, 'quatre scenarios conduits'],
     ['la sonde n emporte pas le vrai jeton', PROUVE,
      'conduite avec un jeton d appareil present : le corps envoye ne le contient pas'],
     ['aucun repli vers l ancienne voie', PROUVE,
      'conduit sans jeton : l appel part quand meme au Worker, jamais a Supabase'],
     ['<b>premiere sauvegarde reelle = pont</b>', ATTENTE,
      'demande le <b>vrai</b> jeton de Michel, donc son telephone'],
     ['<b>seconde sauvegarde reelle = directe</b>', ATTENTE, 'idem'],
     ['ecriture sur le bon compte', ATTENTE, 'se lit dans la console Supabase']],
    [52 * mm, 24 * mm, 90 * mm]))

H.append(P('6. Le test a faire sur le telephone, apres publication', 'h1'))
H.append(P('Tout se lit dans <b>Profil - Admin - miroir</b>. La carte ne declenche aucune '
           'ecriture : elle teste la route et affiche l etat de la <b>derniere vraie</b> '
           'sauvegarde.', 'p'))
H.append(bloc_code(
    "1. ouvrir Profil > Admin > la carte du miroir\n"
    "   attendu : « La route repond et REFUSE un jeton inconnu (HTTP 401) »\n"
    "   attendu : « jeton present sur cet appareil »\n"
    "\n"
    "2. faire une modification quelconque du profil (elle declenche une sauvegarde)\n"
    "   rouvrir la carte\n"
    "   attendu : « Derniere copie miroir - ecrit (voie : pont) »\n"
    "\n"
    "3. refaire une modification, rouvrir la carte\n"
    "   attendu : « Derniere copie miroir - ecrit (voie : directe) »"))
H.append(P('Si l etape 1 annonce <b>aucun jeton sur cet appareil</b>, la suite ne peut pas '
           'fonctionner et ce n est pas un defaut de la bascule : l appareil n a jamais recu de '
           'jeton S1. A dire avant de conclure quoi que ce soit.', 'petit'))

H.append(P('7. V2 reste ouverte - STOP avant fermeture', 'h1'))
H.append(encadre(
    'RIEN N A ETE REVOQUE, ET LE TEMOIN LE DIT DANS LES DEUX SENS',
    'L ancien RPC <font face="Courier">ft_miroir</font> est intact, '
    '<font face="Courier">sbMirror</font> garde son <font face="Courier">p_email</font> libre, '
    'et le temoin qui le constate reste <b>volontairement non retourne</b> : <i>on ne maquille '
    'pas une porte ouverte</i>. La fermeture est une passe a part, sur accord separe de Michel, '
    'et elle attend les deux sauvegardes reelles.'))

H.append(P('8. Tests', 'h1'))
H.append(tableau(
    ['banc', 'resultat'],
    [['passe complete (parcours)', '<b>' + PASSE_OK + '</b> verts, <b>' + PASSE_KO + '</b> rouge'],
     ['banc de la bascule (source + comportement)', '<b>' + BANC_OK + '</b> OK, <b>' + BANC_KO + '</b> rouge'],
     ['controle negatif (arbre clone)', '<b>' + MUT_OK + '/' + MUT_TOT + '</b> conformes, '
      'dont deux qui doivent <b>rester vertes</b>']],
    [80 * mm, 86 * mm]))
H.append(P('Le banc de comportement charge le <b>vrai</b> <font face="Courier">supabase.js</font> '
           'et le <b>vrai</b> injecteur decoupe dans <font face="Courier">constants.js</font> : '
           '<i>un banc qui rejouerait une reecriture de l injecteur validerait la reecriture, pas '
           'la production</i>.', 'petit'))
H.append(P('<b>Un defaut anterieur, signale et non corrige</b> : la suite '
           '<font face="Courier">tests/dates</font> rend <b>8/9</b>, et elle rendait deja 8/9 '
           '<b>avant</b> cette passe - verifie en rejouant la suite sur l arbre publie. Sa cause '
           'est une fixture datee en temps universel dans un bloc Nutrition, sans rapport avec la '
           'bascule. Elle appartient a un autre chantier : elle est <b>dite</b>, pas corrigee au '
           'passage.', 'petit'))

H.append(P('9. Ce que ca ne fait pas', 'h1'))
H.append(P('Nutrition, scanner, douane, journal alimentaire, Accueil, Seance, Progres, Milo : '
           '<b>zero ligne</b>. Ni <font face="Courier">index.html</font>, ni '
           '<font face="Courier">screens.js</font>, ni <font face="Courier">state.js</font>, ni '
           '<font face="Courier">log.js</font>, ni <font face="Courier">coach.js</font>, ni '
           '<font face="Courier">tracking.js</font>, ni <font face="Courier">constants.js</font>, '
           'ni <font face="Courier">worker.js</font>, ni <font face="Courier">Code.js</font>. '
           'L empreinte dans <font face="Courier">app.js</font> est bornee a la carte Admin, et '
           'un temoin le mesure par <b>ou</b> - pas par <b>combien</b>.', 'p'))
H.append(P('<b>Regle d or #11 : rien.</b> Aucun ecran, aucun bouton, aucune valeur affichee ne '
           'bouge cote utilisateur ; seule une carte Admin change ce qu elle teste.', 'petit'))
# @@FIN@@

_bt = ' '.join(TEXTES).lower()
_rendu = (_bt + ' ' + ' '.join(CODES)).lower()

for _mot, _msg in [
        ('v2 est fermee', 'le document annonce une fermeture qui n a pas eu lieu'),
        ('la bascule est validee de bout en bout', 'la preuve reelle n est pas faite'),
        ('premiere sauvegarde reelle mesuree', 'elle ne l est pas encore')]:
    g(_mot not in _bt, _msg)

for _mot, _pourquoi in (
        ('n ecrit rien', 'c est ce qui rend la sonde Admin sure'),
        ('aucun repli', 'c est la decision centrale de la bascule'),
        ('source de verite', 'sans elle, « le miroir n ecrit plus » se lit comme une perte'),
        ('en attente', 'ce qui n est pas prouve doit etre nomme'),
        ('stop avant fermeture', 'la consigne de Michel doit rester dans le document'),
        ('8/9', 'le rouge anterieur se dit plutot que se cache')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))

g('voie : pont' in _rendu and 'voie : directe' in _rendu,
  'le protocole de test ne nomme plus les deux voies attendues')

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-B phase 4 - bascule cloudSave', author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, passe %s/%s, banc %s, mutations %s/%s, V2 ouverte)'
      % (OUT, VERSION, GARDES[0], PASSE_OK, PASSE_KO, BANC_OK, MUT_OK, MUT_TOT))
