#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B PHASE 4 — LA PANNE APPS SCRIPT PENDANT LA MESURE : ce qu'elle explique, ce qu'elle
   n'excuse pas, et ce qui reste bloque.

[!!] LE RELEVE SE LIT DANS SON JOURNAL, JAMAIS DE MEMOIRE (lecon ft-v1201). Le generateur
     refuse de produire si la ligne rouge du serveur manque, si la sauvegarde nocturne cessait
     d'etre verte (ce document en tire sa conclusion sur le stockage), ou si le journal
     cessait de dire que les deux voies ne sont PAS mesurables.

[!!] ⭐⭐ DEUX GARDES A L'ENVERS : il REFUSE de produire si l'un des deux defauts d'affichage
     a ete corrige entre-temps. Un dossier qui decrit un defaut deja repare fait chercher
     quelque chose qui n'existe plus.

[!!] ⭐ ET UNE GARDE D'ARCHITECTURE, qui est le coeur de ce document : il verifie DANS LE CODE
     que le pont n'est appele QU'APRES un refus de Supabase. C'est ce qui rend vraie la phrase
     « seul le PREMIER passage depend de Google ». Si cet ordre changeait, la conclusion du
     dossier deviendrait fausse sans que personne ne le voie.

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
    SCRATCH, 'S2B-PANNE-APPS-SCRIPT-18-09-2026.pdf')
LOG = os.environ.get('FT_LOG') or os.path.join(SCRATCH, 'panne_apps_script_1809.log')

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
CJ = sans_commentaires(lire('Code.js'))
HTM = lire('index.html')

CS = corps_fn(W, 'cloudSave')
PONT = corps_fn(W, '_identiteIA')
ETAT = corps_fn(SB, '_sbEtatDepuis')

# ── ⭐ LA GARDE D'ARCHITECTURE : seul le PREMIER passage depend de Google ────────────────
g('APPS_SCRIPT_URL' in PONT, 'le pont ne vise plus Apps Script : la cause decrite serait fausse')
_iSb = CS.find("_sbAppel(env, 'ft_enregistrer_instantane'")
_iPont = CS.find('_identiteIA(brut, env)')
g(0 < _iSb < _iPont,
  'le pont n est plus appele APRES Supabase : la phrase « seul le premier passage depend de '
  'Google » deviendrait fausse')
g(CS.count("_sbAppel(env, 'ft_enregistrer_instantane'") == 2,
  'la seconde tentative d ecriture a disparu : le chemin decrit a change')
g("voie: 'directe'" in CS and "voie: 'pont'" in CS,
  'les deux voies ne sont plus nommees dans la route')
# ⭐ La voie DIRECTE se rend AVANT tout appel au pont : c'est ce qui prouve qu'elle n'en
#    depend pas. Mesure de position, pas d'impression.
g(CS.find("voie: 'directe'") < _iPont,
  'la voie directe n est plus rendue avant le pont : elle en dependrait')

# ── la chaine des raisons observees ─────────────────────────────────────────────────────
g("catch (e) { return { ok: false, raison: 'reseau' }; }" in PONT,
  'le pont ne rend plus « reseau » quand Apps Script ne repond pas')
g('raison: moi.raison' in CS, 'la route ne relaie plus la raison du pont')
g("catch (err) { return json_({status:'error', error:'auth'}); }" in CJ,
  'le catch d Apps Script a change : « refus » n aurait plus la meme origine')

# ── ⭐⭐ GARDES A L'ENVERS : les deux defauts sont-ils TOUJOURS ouverts ? ────────────────
_b401 = ETAT[ETAT.find('statut === 401'):]
_cas = re.findall(r"if \(r === '([a-z]+)'\)", _b401)
g(_cas == ['revoque', 'forme'],
  'la branche 401 ne traite plus exactement « revoque » puis « forme » (%s) : le defaut '
  'decrit est corrige, ce dossier est perime' % _cas)
g("'identité refusée (' + r + ')'" in _b401,
  'le fourre-tout « identite refusee » a disparu : le defaut est corrige')
PROMESSE = 'Le bouton écrit une ligne de test <strong>pour de vrai</strong>'
g(PROMESSE in HTM,
  'le texte de la carte ne promet plus une ecriture : le second defaut est corrige')

# ── l etat du chantier ──────────────────────────────────────────────────────────────────
g('p_email: email' in SB, 'V2 serait fermee : ce dossier decrit un etat intermediaire')
g("SB_VOIE = 'worker'" in SB, 'la voie par defaut n est plus celle du jeton')
g('token:SB_SONDE_JETON' in corps_fn(SB, 'sbTestVoie'),
  'la sonde ne pose plus son jeton factice')

# ── LE RELEVE : lu dans son journal ────────────────────────────────────────────────────
g(os.path.exists(LOG), 'le journal de la panne est introuvable : rien a publier')
J = open(LOG, encoding='utf-8', errors='replace').read()
g(re.search(r'(?im)^ROUGE\s+Le serveur repond\s*: INJOIGNABLE', J) is not None,
  'le journal ne porte plus, sur SA ligne, le serveur en ROUGE')
_v = re.search(r'(?im)^VERT\s+Sauvegardes automatiques', J)
g(_v is not None,
  'le journal ne porte plus la sauvegarde nocturne en VERT : ce document en tire sa '
  'conclusion « le stockage n est pas sature »')
g('backup-2026-09-18.json' in J, 'le journal ne nomme plus la sauvegarde du jour')
_h = re.search(r'verifie a (\d\d:\d\d:\d\d)', J)
g(_h is not None, 'le journal ne porte plus l heure de la verification')
QUAND = _h.group(1)
g(re.search(r'(?im)^voie:pont\s*:\s*NON MESURABLE', J) is not None,
  'le journal ne dit plus, sur SA ligne, que la voie « pont » n est pas mesurable')
g(re.search(r'(?im)^voie:directe\s*:\s*NON MESURABLE', J) is not None,
  'le journal ne dit plus, sur SA ligne, que la voie « directe » n est pas mesurable')
g(re.search(r'(?im)^Seances locales\s*:\s*INTACTES', J) is not None,
  'le journal ne dit plus que les seances locales sont intactes : c est le point qui rassure')
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


def _v2(s):
    rendu = html.unescape(s)
    try:
        rendu.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE - hors cp1252 apres rendu : %r (dans %r)'
                         % (rendu[e.start:e.end], s[:70]))
    return s


def P(txt, st='p'):
    TEXTES.append(txt)
    return Paragraph(_v2(txt), ST[st])


def bloc_code(txt):
    CODES.append(txt)
    lignes = [Paragraph(_v2(html.escape(l).replace(' ', '&nbsp;')), ST['code'])
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
    t = Table([[Paragraph(_v2('<b>' + titre + '</b>'), ST['cell'])],
               [Paragraph(_v2(corps), ST['cell'])]], colWidths=[166 * mm])
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
    data = [[Paragraph(_v2('<b>' + h + '</b>'), ST['cellg']) for h in entetes]]
    for r in lignes:
        data.append([Paragraph(_v2(c), ST['cell']) for c in r])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), FOND),
        ('GRID', (0, 0), (-1, -1), 0.35, TRAIT),
        ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 4.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 6)])


RG = '<font color="#C0392B"><b>ROUGE</b></font>'
VT = '<font color="#1E7A46"><b>VERT</b></font>'
OR = '<font color="#B26A00"><b>ORANGE</b></font>'

# ═══════════════════════════════════════════════════════════════════════════════════════
# II. LE DOCUMENT
# ═══════════════════════════════════════════════════════════════════════════════════════
H = []
# @@DEBUT@@
H.append(P('S2-B phase 4 - Apps Script tombe pendant la mesure', 'titre'))
H.append(P('Force Tracker - 18 septembre 2026, ' + QUAND + ' - base servie ' + VERSION
           + ' - hors depot (regle d or #14) - <b>V2 n est PAS fermee</b>', 'sous'))

H.append(encadre(
    'EN UNE PHRASE',
    'Le backend Google ne repond plus - <b>injoignable, trop lent</b> - et c est la cause '
    'commune des echecs observes depuis 13:40. Ce n est <b>pas</b> la bascule : Apps Script '
    'est en rade pour <b>tout</b>, y compris la synchro des seances et la verification '
    'premium. <b>Rien n est perdu</b> : les seances sont sur le telephone et la sauvegarde '
    'de la nuit a bien tourne.'))

H.append(P('1. Le releve', 'h1'))
H.append(tableau(
    ['', 'ce que dit la carte « Sante du systeme »'],
    [[RG + ' Le serveur repond', '<b>INJOIGNABLE (trop lent, plus de 20 s)</b> - et l ecran '
      'ajoute lui-meme : pas de sauvegarde cloud, pas de verification premium, pas de synchro '
      'des seances'],
     [RG + ' Stockage des comptes', 'sonde injoignable : trop lent (plus de 25 s)'],
     [OR + ' Consommation IA', 'sonde injoignable : trop lent (plus de 25 s)'],
     [VT + ' Sauvegardes de la nuit', '2x par jour, 88 fichiers, derniere '
      '<font face="Courier">backup-2026-09-18.json</font> (aujourd hui)'],
     [VT + ' Envoi des mails', 'aucun echec'],
     [OR + ' Mises en ligne', 'app OK 18/09 13:50 - serveur : aucun deploiement trouve']],
    [46 * mm, 120 * mm]))

H.append(P('2. Ce que la panne explique, et ce qu elle n excuse pas', 'h1'))
H.append(P('Les trois echecs de la matinee - <font face="Courier">reseau</font> a 13:40 et '
           '13:58, <font face="Courier">refus</font> a 13:59 - ont desormais une cause '
           'commune et mesuree. <b>Elle n excuse pas les deux defauts d affichage</b> : au '
           'contraire, elle les rend visibles en vrai. Pendant que Google est en rade, la '
           'carte annonce <b>« identite refusee »</b> a quelqu un dont le compte va '
           'parfaitement bien.', 'p'))

H.append(P('3. Pourquoi la bascule ne peut pas etre mesuree maintenant', 'h1'))
H.append(encadre(
    'SEUL LE PREMIER PASSAGE DEPEND DE GOOGLE - ET C EST TOUT L INTERET DU CHANTIER',
    'Le <b>pont</b>, c est Apps Script. La <b>premiere</b> sauvegarde d un appareil en a besoin '
    'par construction : Supabase ne connait pas encore le hache, donc le Worker se tourne vers '
    'Google pour demander a qui il appartient. Google ne repond pas, donc pas de '
    '<font face="Courier">voie:pont</font>, donc pas de <font face="Courier">voie:directe</font> '
    'non plus. Une fois le hache inscrit, la voie directe est rendue <b>avant tout appel au '
    'pont</b> - verifie par position dans le code, pas par impression. <i>La dependance a '
    'Google existe exactement une fois par appareil, et ce chantier est la pour la supprimer '
    'ensuite.</i>'))
H.append(bloc_code(
    "worker.js, cloudSave - l'ordre qui rend la phrase vraie :\n"
    "  1. _sbAppel('ft_enregistrer_instantane')  -> si OK : voie « directe », FIN\n"
    "  2. sinon, et seulement sinon : _identiteIA()  -> le pont, donc Google\n"
    "  3. _sbAppel('ft_inscrire_jeton') puis une 2e tentative -> voie « pont »"))

H.append(P('4. Ce qui n est pas en cause', 'h1'))
H.append(tableau(
    ['', ''],
    [['les seances', '<b>intactes sur le telephone</b> - « Tout synchronise (49 seances) » '
      'releve a 13:44, juste avant la panne'],
     ['le stockage Apps Script', '<b>pas sature</b> : la sauvegarde de la nuit a tourne '
      'aujourd hui. Ce n est pas le 29 juillet, ou plus rien ne s ecrivait ; c est la '
      '<b>lenteur</b>'],
     ['le jeton de Michel', 'present sur l appareil, mesure a 13:44'],
     ['la bascule ft-v1222', 'le chemin fonctionne - la sonde a prouve la chaine complete a '
      '13:44, avant que Google ne parte'],
     ['Apps Script comme source de verite', 'inchange : des qu il revient, tout repart']],
    [46 * mm, 120 * mm]))

H.append(P('5. Ce qui reste a faire, dans l ordre', 'h1'))
H.append(bloc_code(
    "1. attendre que « Le serveur repond » repasse au VERT\n"
    "   (Profil > Admin > Sante du systeme > « Verifier maintenant »)\n"
    "\n"
    "2. quand c'est vert : une sauvegarde, puis « Tester la copie miroir »\n"
    "   attendu : « ecrit (voie : pont) »\n"
    "\n"
    "3. une seconde sauvegarde -> attendu : « ecrit (voie : directe) »\n"
    "\n"
    "4. ensuite seulement, et sur accord separe : la fermeture de V2"))

H.append(P('6. Les deux corrections toujours en attente d accord', 'h1'))
H.append(tableau(
    ['correction', 'pourquoi elle monte d un cran aujourd hui', 'portee'],
    [['une panne cesse d etre annoncee comme un refus d identite',
      'le cas theorique de ce matin <b>se produit en vrai</b> a l ecran',
      '<font face="Courier">supabase.js</font>'],
     ['le texte de la carte cesse de promettre une ecriture',
      'la phrase decrit un bouton qui n existe plus',
      '<font face="Courier">index.html</font>']],
    [56 * mm, 68 * mm, 42 * mm]))
H.append(P('<b>Aucune des deux n est faite.</b> Elles ne dependent pas de Google et rendraient '
           'cet ecran honnete pendant les pannes - mais rien ne se code sans accord '
           '(regles d or #15 et #16).', 'petit'))

H.append(P('7. La borne de ce diagnostic', 'h1'))
H.append(P('<b>Tout ce document vient de l ecran de Michel, pas d une mesure faite depuis le '
           'conteneur.</b> Le domaine de Google y est refuse par la politique reseau - '
           'constat technique, pas supposition. Je ne peux donc <b>ni confirmer ni infirmer</b> '
           'la panne autrement que par ce qu affiche son telephone, et je ne sais pas combien '
           'de temps elle durera.', 'p'))
H.append(P('<b>Et une chose n est pas expliquee</b> : entre 13:59 et 14:00, la sonde a change '
           'de reponse pour le <b>meme</b> jeton factice (« inconnu » puis « refus »). La panne '
           'est une explication plausible, elle n est pas une preuve. <i>Je prefere le dire que '
           'de fabriquer une histoire qui tienne debout.</i>', 'p'))
# @@FIN@@

_bt = ' '.join(TEXTES).lower()
_rendu = (_bt + ' ' + ' '.join(CODES)).lower()

for _mot, _msg in [
        ('v2 est fermee', 'le document annonce une fermeture qui n a pas eu lieu'),
        ('la bascule est validee', 'les deux voies ne sont pas mesurees'),
        ('defaut corrige', 'aucune des deux corrections n est faite'),
        ('donnees perdues', 'rien n est perdu')]:
    g(_mot not in _bt, _msg)

for _mot, _pourquoi in (
        ('rien n est perdu', 'c est le point qui rassure, et il est mesure'),
        ('pas saturé', 'la sauvegarde de la nuit le prouve') if False else
        ('pas sature', 'la sauvegarde de la nuit le prouve'),
        ('seul le premier passage', 'c est la conclusion d architecture du dossier'),
        ('n est pas une preuve', 'la contradiction non expliquee doit rester dite'),
        ('aucune des deux n est faite', 'rien n a ete code sans accord'),
        ('politique reseau', 'la borne du diagnostic')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))

g('voie : pont' in _rendu and 'voie : directe' in _rendu,
  'le document ne nomme plus les deux voies attendues')
g(QUAND in _rendu, 'l heure de la verification n est plus citee')

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-B phase 4 - panne Apps Script', author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, releve %s, 2 defauts NON corriges, V2 ouverte)'
      % (OUT, VERSION, GARDES[0], QUAND))
