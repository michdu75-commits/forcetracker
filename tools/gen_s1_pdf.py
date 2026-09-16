#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dossier GPT — S1, IDENTITE SERVEUR MINIMALE (etape 1 : audit, conception, temoins).
   Hors depot (regle d'or #14, le depot est public).

[!!] CE DOCUMENT AFFIRME QUE S1 N'EST PAS IMPLEMENTE. Ses gardes le REVERIFIENT dans le code :
     si un jeton apparait quelque part, le document est perime et doit refuser de sortir.
     *Un dossier qui dit « pas encore fait » alors que c'est fait est aussi faux que l'inverse.*

[!!] ET LE TOTAL DE LA PASSE SE LIT DANS SON JOURNAL, JAMAIS A LA MAIN (lecon ft-v1201) :
     le generateur refuse de produire tant que la ligne TOTAL n'existe pas.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji.
"""
import html
import os
import re
import subprocess
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
OUT = os.environ.get('FT_OUT') or os.path.join(SCRATCH, 'DOSSIER-S1-IDENTITE-SERVEUR-16-09-2026.pdf')
PASSE = os.environ.get('FT_PASSE') or '/tmp/passe_s1.log'

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


CODEJS = lire('Code.js')
WORKER = lire('worker.js')
SB = lire('supabase.js')
SW = lire('sw.js')
RUN = lire(os.path.join('tests', 'parcours', 'runner.js'))
DOSSIER = lire(os.path.join('docs', 'DOSSIER-S1-IDENTITE-SERVEUR.md'))

VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]
g(VERSION == 'ft-v1215',
  'la version servie n\'est plus ft-v1215 (%s) : le dossier annonce un depart a ft-v1215' % VERSION)


def corps(src, nom):
    m = re.search(r'(?:async\s+)?function\s+%s\s*\(' % re.escape(nom), src)
    if not m:
        return ''
    i = src.index('{', m.end() - 1)
    n, j = 0, i
    while j < len(src):
        if src[j] == '{':
            n += 1
        elif src[j] == '}':
            n -= 1
            if n == 0:
                return src[i:j + 1]
        j += 1
    return src[i:]


# ── [!!] S1 N'EST PAS IMPLEMENTE : les quatre defauts doivent etre TOUJOURS LA ──────────────
g(re.search(r'stored\.length<20\)\s*return\s*\{ok:true', corps(CODEJS, '_authCheck_')) is not None,
  'l\'ecriture sans code semble CORRIGEE : le dossier repond OUI a la question 1, il mentirait')
for jeton in ('Authorization', 'x-ft-token', 'deviceToken', 'ft_token'):
    g(jeton not in WORKER,
      'le Worker exige desormais « %s » : S1 est (partiellement) fait, le dossier est perime' % jeton)
g('p_email: email' in SB or 'p_email:email' in SB.replace(' ', ''),
  'ft_miroir ne recoit plus un p_email libre : la mention « V2 RESTE OUVERTE » serait fausse')
g('q.byEmail[e]' in corps(CODEJS, '_aiQuotaBlock_'),
  'le quota n\'est plus indexe sur l\'e-mail : le dossier l\'affirme')

# ── LE BOOTSTRAP : ses quatre bornes, relues et non retapees ────────────────────────────────
for motif, quoi in ((r'cur\.tries\s*>=\s*5', '5 essais'),
                    (r'exp:\s*now\s*\+\s*15\s*\*\s*60000', 'expiration 15 min'),
                    (r'now\s*-\s*cur\.sentAt\)\s*<\s*60000', 'cooldown 60 s'),
                    (r"_dailyCounterBlock_\('confirm_send_quota',\s*80\)", 'plafond 80/jour')):
    g(re.search(motif, CODEJS) is not None,
      'la borne « %s » du bootstrap a disparu : c\'est elle qui rend la preuve e-mail utilisable' % quoi)
# [!] La faiblesse doit rester vraie tant que le dossier la signale.
g(re.search(r"var code = '' \+ Math\.floor\(100000 \+ Math\.random\(\)", CODEJS) is not None,
  'le code de confirmation n\'est plus produit par Math.random() : le dossier signale cette '
  'faiblesse, elle serait perimee')

# ── PROPRIETES A PRESERVER ─────────────────────────────────────────────────────────────────
g(not re.search(r'body\.premium|data\.premium|p\.premium', CODEJS),
  'le serveur lit desormais un premium fourni par le client : le dossier affirme le contraire')
g('needsCode' in corps(CODEJS, '_lectureAutorisee_'), 'la lecture stricte a disparu')

# ── LES TEMOINS EXISTENT VRAIMENT, ET ILS SONT AU NOMBRE ANNONCE ───────────────────────────
N_TEMOINS = len(re.findall(r"t\('B-CCCXIII ", RUN))
g(N_TEMOINS == 10, 'le bloc B-CCCXIII ne porte plus 10 temoins (%d)' % N_TEMOINS)
g('B-CCCXIII' in RUN and 'les RETOURNER' in RUN or 'RETOURNER' in RUN,
  'les temoins de defaut ne portent plus la consigne de les RETOURNER (R30)')

# ── [!!] LE TOTAL DE LA PASSE SE LIT DANS SON JOURNAL ──────────────────────────────────────
try:
    LOG = open(PASSE, encoding='utf-8').read()
except OSError:
    LOG = ''
_m = re.search(r'TOTAL CROIS\S+\s*:\s*(\d+)\s*\S+\s*\S+\s*(\d+)', LOG)
g(bool(_m),
  'la passe n\'a pas de ligne TOTAL dans %s : une passe tronquee ressemble trait pour trait a une '
  'passe verte (BUGS.md §61) - attendre sa fin avant de produire ce document' % PASSE)
PASSE_OK, PASSE_KO = int(_m.group(1)), int(_m.group(2))
g(PASSE_KO == 0, 'la passe porte %d rouge(s) : rien ne se publie' % PASSE_KO)
g('B-CCCXIII' in LOG, 'le bloc S1 n\'apparait pas dans le journal de la passe : elle a ete lancee '
                      'sur un arbre qui ne le contenait pas')

# ── PERIMETRE : aucun fichier servi modifie ────────────────────────────────────────────────
SERVIS = {'app.js', 'log.js', 'coach.js', 'setup.js', 'screens.js', 'state.js', 'tracking.js',
          'constants.js', 'index.html', 'style.css', 'sw.js', 'worker.js', 'Code.js',
          'supabase.js', 'wrangler.toml'}
try:
    _mod = subprocess.run(['git', 'diff', '--name-only', 'HEAD'], cwd=ROOT,
                          capture_output=True, text=True).stdout.split()
    _t = sorted(SERVIS & set(_mod))
    g(not _t, 'le dossier annonce « aucun fichier servi modifie », or %s a change' % ', '.join(_t))
except FileNotFoundError:
    pass

# ── LE DOSSIER TIENT-IL SES ENGAGEMENTS ? ──────────────────────────────────────────────────
g('ARR' in DOSSIER and 'AVANT MUTATION' in DOSSIER, 'le dossier n\'annonce plus l\'arret')
g('V2 RESTE OUVERTE' in DOSSIER,
  'le dossier ne dit plus que Supabase reste ouverte jusqu\'a S2 : il pretendrait avoir ferme '
  'ce qu\'il n\'a pas mesure')
for q in ('Question 1', 'Question 2', 'Question 3'):
    g(q in DOSSIER, 'la %s a disparu' % q)
g(re.search(r'Question 1.*?\*\*OUI\*\*', DOSSIER, re.S) is not None,
  'la reponse a la question 1 n\'est plus OUI : S1 n\'etant pas implemente, elle doit l\'etre')
g('Math.random' in DOSSIER, 'le dossier ne signale plus la faiblesse du bootstrap')

# ═══════════════════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46')
ORANGE = colors.HexColor('#B26A00')

S = getSampleStyleSheet()
st = {
    'titre': ParagraphStyle('titre', parent=S['Title'], fontName='Helvetica-Bold', fontSize=18,
                            leading=22, textColor=ENCRE, alignment=TA_LEFT, spaceAfter=2),
    'sous': ParagraphStyle('sous', parent=S['Normal'], fontName='Helvetica', fontSize=9.5,
                           leading=13, textColor=GRIS, spaceAfter=13),
    'h1': ParagraphStyle('h1', parent=S['Heading1'], fontName='Helvetica-Bold', fontSize=12.5,
                         leading=15.5, textColor=ROUGE, spaceBefore=13, spaceAfter=5),
    'p': ParagraphStyle('p', parent=S['Normal'], fontName='Helvetica', fontSize=9.2, leading=13.0,
                        textColor=ENCRE, spaceAfter=6),
    'petit': ParagraphStyle('petit', parent=S['Normal'], fontName='Helvetica', fontSize=8.2,
                            leading=11.5, textColor=GRIS, spaceAfter=5),
    'cell': ParagraphStyle('cell', parent=S['Normal'], fontName='Helvetica', fontSize=8.0,
                           leading=10.4),
    'cellb': ParagraphStyle('cellb', parent=S['Normal'], fontName='Helvetica-Bold', fontSize=8.0,
                            leading=10.4),
}


def _v(x, ou='texte'):
    if isinstance(x, str):
        for ch in x:
            try:
                ch.encode('cp1252')
            except UnicodeEncodeError:
                raise SystemExit('CARACTERE NON RENDU %r (%s) dans %s' % (ch, hex(ord(ch)), ou))
        for m in re.finditer(r'&#(\d+);|&#[xX]([0-9a-fA-F]+);', x):
            n = int(m.group(1)) if m.group(1) else int(m.group(2), 16)
            try:
                chr(n).encode('cp1252')
            except UnicodeEncodeError:
                raise SystemExit('ENTITE HTML NON RENDUE %s dans %s' % (m.group(0), ou))
        for m in re.finditer(r'&([A-Za-z][A-Za-z0-9]{1,15});', x):
            ch = html.unescape(m.group(0))
            if len(ch) == 1:
                try:
                    ch.encode('cp1252')
                except UnicodeEncodeError:
                    raise SystemExit('ENTITE NOMMEE NON RENDUE %s dans %s' % (m.group(0), ou))
    return x


C = "<font face='Courier'>%s</font>"


def P(t, s='p'):
    return Paragraph(_v(t, 'paragraphe'), st[s])


def encadre(titre, corps_, couleur=ROUGE):
    t = Table([[Paragraph('<b>%s</b>' % _v(titre, 'titre'), st['cellb'])],
               [Paragraph(_v(corps_, 'corps'), st['cell'])]], colWidths=[166 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.4, couleur), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return KeepTogether(t)


def tableau(entetes, ligs, largeurs):
    data = [[Paragraph('<b>%s</b>' % _v(h, 'en-tete'), st['cellb']) for h in entetes]]
    for l in ligs:
        data.append([Paragraph(_v(c, 'cellule'), st['cell']) for c in l])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EDEDEA')),
        ('GRID', (0, 0), (-1, -1), 0.4, TRAIT), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    return t


def pied(cv, doc):
    cv.saveState()
    cv.setFont('Helvetica', 7.4)
    cv.setFillColor(GRIS)
    cv.drawString(22 * mm, 12 * mm,
                  'Force Tracker - S1 identite serveur - etape 1 - %s - 16/09/2026' % VERSION)
    cv.drawRightString(A4[0] - 22 * mm, 12 * mm, 'page %d' % cv.getPageNumber())
    cv.restoreState()


H = []
H.append(P('S1 - Identite serveur minimale', 'titre'))
H.append(P('Force Tracker &middot; 16/09/2026 &middot; %s &middot; <b>etape 1 : audit, conception '
           'et temoins. Arret avant mutation.</b>' % VERSION, 'sous'))

H.append(encadre('POURQUOI JE M ARRETE ICI',
                 'Michel a ecrit : <i>&laquo; SI UNE DECISION PRODUIT EST NECESSAIRE : STOP. Ne '
                 'decide pas a la place de Michel &raquo;</i> - et il nomme lui-meme <b>quatre</b> '
                 'de ces decisions : comptes sans code, duree de vie du jeton, multi-appareil, '
                 'recuperation apres perte.<br/><br/>'
                 'Ce sont exactement les <b>quatre parametres qui determinent le code a ecrire</b>. '
                 'Implementer puis demander serait decider en silence.'))
H.append(Spacer(1, 6))

H.append(P('La bonne nouvelle : le point bloquant n est pas bloque', 'h1'))
H.append(P('Michel demandait d arreter <i>si aucune preuve fiable n existe pour les comptes sans '
           'code</i>. <b>Une preuve existe, deja deployee et correctement bornee</b> : la '
           'verification d adresse e-mail.', 'p'))
H.append(tableau(['garde-fou', 'valeur lue dans Code.js'],
                 [['essais avant destruction du code', '<b>5</b>, puis l entree est supprimee'],
                  ['expiration', '<b>15 minutes</b>'],
                  ['anti-renvoi', '<b>60 s</b> par adresse'],
                  ['plafond d envois', '<b>80 / jour</b>, global']],
                 [76 * mm, 90 * mm]))
H.append(Spacer(1, 4))
H.append(P('Force brute : ~80 codes/jour x 5 essais = <b>400 tentatives/jour contre 10^6</b> - '
           'negligeable. <b>Le bootstrap est donc possible pour TOUS les comptes.</b> Ce qui reste '
           'a trancher n est pas <i>&laquo; peut-on ? &raquo;</i> mais <i>&laquo; qu arrive-t-il a '
           'quelqu un qui n a pas encore fait le geste ? &raquo;</i>', 'p'))
H.append(encadre('UNE FAIBLESSE A CORRIGER SI CE CHEMIN DELIVRE UN CREDENTIAL',
                 'Le code de confirmation est produit par <b>Math.random()</b> - precisement ce que '
                 'Michel interdit pour un credential. Ce n est pas critique aujourd hui (les bornes '
                 'ci-dessus font le travail), mais <b>le jour ou ce code devient la porte d entree '
                 'd un jeton, il devient un maillon de la chaine d identite</b>.', ORANGE))

H.append(P('Ce qui est reellement verifie aujourd hui', 'h1'))
H.append(tableau(['flux', 'preuve REELLEMENT verifiee', 'identite cote serveur'],
                 [['lecture du compte', '<b>code perso obligatoire</b>', 'l e-mail, mais PROUVE'],
                  ['<b>ecriture du compte</b>', '<b>AUCUNE si pas de code</b>', 'l e-mail DECLARE'],
                  ['<b>sante (pushHealth)</b>', '<b>AUCUNE si pas de code</b>', 'l e-mail DECLARE'],
                  ['<b>miroir (ft_miroir)</b>', '<b>aucune</b>', 'l e-mail DECLARE'],
                  ['<b>appels IA (Worker)</b>', '<b>en-tete Origin seul</b>', 'l e-mail DECLARE'],
                  ['Premium', '<b>etat serveur uniquement</b>', 'serveur'],
                  ['pose d un code', '<b>verification e-mail</b>', 'prouve']],
                 [44 * mm, 66 * mm, 56 * mm]))
H.append(Spacer(1, 4))
H.append(P('[!] <b>Deux proprietes sont DEJA correctes</b>, et S1 ne doit pas les casser : le '
           'serveur <b>ne lit jamais</b> un ' + (C % 'premium') + ' fourni par le client (mesure : '
           '0 occurrence), et la <b>lecture</b> est deja fermee. <i>Le test &laquo; Free + '
           'premium:true - reste Free &raquo; passe donc deja.</i>', 'p'))

H.append(P('Le credential propose', 'h1'))
H.append(tableau(['exigence de Michel', 'reponse'],
                 [['forte entropie, primitive standard',
                   (C % 'crypto.getRandomValues(new Uint8Array(32))') + ' - <b>256 bits</b>'],
                  ['jamais Math.random()', 'respecte cote client ET serveur a l emission'],
                  ['non derive de l e-mail', 'aleatoire pur'],
                  ['individuel, revocable, renouvelable', 'une ligne par jeton'],
                  ['multi-appareils', '<b>N jetons par compte</b>, jamais 1 compte = 1 jeton']],
                 [58 * mm, 108 * mm]))
H.append(Spacer(1, 4))
H.append(P('<b>Stockage serveur : le HACHE, jamais le brut.</b> ' + (C % 'SHA-256(token)') +
           ' suffit - contrairement a un mot de passe, un jeton de 256 bits n est pas devinable, '
           'donc ni sel ni derivation lente. Le hache est <b>directement une cle de recherche</b>, '
           'et <b>une fuite de base ne donne aucun jeton utilisable</b>.', 'p'))
H.append(P('<b>Stockage client</b> : ' + (C % 'localStorage') + ' aujourd hui. [!] Limites dites '
           'franchement : une <b>XSS</b> le lit, un <b>vidage du navigateur</b> l efface, un '
           '<b>changement de navigateur</b> ne le transporte pas, un <b>telephone perdu</b> le '
           'laisse dans la nature jusqu a revocation. Plus tard : Keystore et Keychain - rien de '
           'natif maintenant.', 'p'))
H.append(P('<b>Identite canonique : pas d accountId maintenant.</b> Il faudrait migrer toutes les '
           'cles existantes - la <i>migration disproportionnee</i> que Michel dit de ne pas forcer. '
           '<b>Le jeton porte l identite ; l e-mail reste la cle de stockage mais cesse d etre une '
           'preuve</b>, et la table des jetons est le point d indirection qui rendra un futur '
           'accountId indolore.', 'p'))

H.append(P('Les quatre decisions qui appartiennent a Michel', 'h1'))
H.append(P('<b>1. Les comptes existants sans code</b> - la seule vraiment lourde.', 'p'))
H.append(tableau(['', 'comportement', 'cout'],
                 [['<b>A</b> - fail-closed tout de suite',
                   'ecriture sensible refusee tant que le jeton n est pas obtenu',
                   'la <b>sauvegarde cloud</b> s arrete pour ces comptes ; aucune seance perdue '
                   '(local-first) mais le filet est suspendu'],
                  ['<b>B</b> - fenetre de transition',
                   'ancien chemin encore accepte N jours, <b>journalise</b>',
                   'la faille reste ouverte N jours, mais on <b>mesure</b> combien de comptes '
                   'restent a migrer'],
                  ['<b>C</b> - bootstrap silencieux',
                   'jeton emis a qui presente l e-mail',
                   '<b>exactement la faille actuelle avec un jeton par-dessus - Michel l interdit</b>']],
                 [42 * mm, 56 * mm, 68 * mm]))
H.append(Spacer(1, 4))
H.append(P('<b>Recommandation : B</b>, avec une date de bascule decidee a l avance et un compteur. '
           'Raison : <b>A oppose S1 a la regle d or n°3</b>. Local-first fait qu aucune seance n est '
           'perdue, mais couper le cloud a quelqu un qui ne sait pas encore qu il doit agir, c est '
           'retirer son filet sans prevenir. <b>C est exclu.</b>', 'p'))
H.append(P('<b>2. Duree de vie</b> : recommandation <b>pas d expiration, mais une revocation</b> - '
           'un jeton qui expire deconnecte quelqu un en pleine salle. <b>3. Multi-appareil</b> : '
           '<b>N jetons des le depart</b> (le schema le permet sans surcout). <b>4. Recuperation</b> : '
           '<b>le meme chemin que le bootstrap</b> - <i>une deuxieme porte de recuperation est une '
           'deuxieme porte d entree.</i>', 'p'))

H.append(P('Ce que S1 fermera - et ce qu il ne fermera pas', 'h1'))
H.append(encadre('V2 RESTE OUVERTE JUSQU A S2',
                 'Le miroir Supabase est appele <b>depuis le navigateur</b>, pas depuis le Worker '
                 '(0 occurrence de Supabase dans ' + (C % 'worker.js') + '). Le fermer imposerait '
                 'de faire passer l ecriture par le Worker - c est-a-dire <b>S2</b>.<br/><br/>'
                 '<i>Dire &laquo; ferme &raquo; sans cette mesure serait exactement ce que Michel '
                 'interdit.</i>', ORANGE))

H.append(P('Performance - et ce que je ne peux pas encore chiffrer', 'h1'))
H.append(P('Taille du credential : <b>32 octets</b> (64 en hexadecimal), negligeable dans un '
           'payload de ~79 Ko. Appels reseau supplementaires cote client : <b>0</b> - le jeton '
           'voyage dans les requetes existantes.', 'p'))
H.append(P('[!] <b>Et c est la que se joue la performance</b> : un jeton <b>opaque</b> impose une '
           'consultation a chaque appel IA ; un jeton <b>signe</b> (HMAC avec le secret du Worker) '
           'se verifie <b>sans aucun aller-retour</b>, au prix d une revocation moins immediate. '
           '<b>Non tranche, et non mesurable d ici</b> : Apps Script est injoignable depuis ce '
           'conteneur. <i>Je ne dirai pas &laquo; negligeable &raquo; sans chiffre.</i>', 'p'))

H.append(P('Temoins poses aujourd hui - bloc B-CCCXIII, %d temoins' % N_TEMOINS, 'h1'))
H.append(P('<b>1 a 4 epinglent les DEFAUTS</b> (ecriture sans code, Worker sans credential, '
           'p_email libre, quota sur l e-mail). <b>Ils DOIVENT rougir le jour ou S1 les corrige</b> - '
           'chacun porte la consigne de le <i>retourner</i>, pas de le supprimer : <i>un temoin qui '
           'disparait ne laisse aucune trace de la decision</i>. <b>5 a 7 epinglent des proprietes '
           'a PRESERVER</b>, <b>8 et 9 le bootstrap</b> et sa faiblesse, <b>10 le perimetre '
           'Nutrition</b>.', 'p'))

H.append(P('Questions finales - reponses mesurees', 'h1'))
H.append(tableau(['question', 'reponse', 'preuve'],
                 [['1. un client modifie connaissant un e-mail peut-il encore usurper ?',
                   '<b>OUI</b> - inchange',
                   'S1 n est pas implemente ; temoins 1 a 4 verts sur le code servi'],
                  ['2. peut-on consommer l IA payee par Michel sans credential ?',
                   '<b>OUI</b> - inchange',
                   'le Worker n exige aucun jeton ; borne a 600 appels/jour'],
                  ['3. pourra-t-on batir S2 puis S3 sans reecrire S1 ?',
                   '<b>PARTIEL</b>',
                   'la table de jetons rend un futur accountId indolore et N jetons evite le '
                   'cul-de-sac ; mais <b>opaque vs signe</b> reste ouvert et change la facon dont '
                   'S2 et S3 verifieront l identite']],
                 [58 * mm, 30 * mm, 78 * mm]))

H.append(Spacer(1, 6))
H.append(P('Ce PDF est genere par <font face="Courier">tools/gen_s1_pdf.py</font>, dont les %d '
           'gardes relisent chaque fait dans le code et <b>refusent de produire</b> si un seul '
           'tombe - y compris, et c est le plus important ici, si S1 se trouvait <b>deja '
           'implemente</b> : un dossier qui dit &laquo; pas encore fait &raquo; alors que c est fait '
           'est aussi faux que l inverse. Le total de la passe (<b>%d OK / %d rouges</b>) est '
           '<b>lu dans son journal</b>, jamais ecrit a la main.'
           % (GARDES[0], PASSE_OK, PASSE_KO), 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - S1 identite serveur (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)
print('OK %s  (%s, %d gardes, %d temoins, passe %d/%d)'
      % (OUT, VERSION, GARDES[0], N_TEMOINS, PASSE_OK, PASSE_OK + PASSE_KO))
