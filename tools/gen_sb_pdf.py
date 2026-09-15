#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dossier GPT — Supabase peut-il porter l'idempotence du debrief ? (AUDIT SEUL)
   Hors depot (regle d'or #14, le depot est public).

TOUS LES FAITS SONT RELUS DANS LE DEPOT : l'architecture du miroir dans `supabase.js`, son site
d'appel et le CONTENU du payload dans `setup.js`, l'absence de Supabase dans `worker.js`, la
faiblesse documentee dans le journal d'archive, l'identifiant de seance dans `log.js`.

[!!] Deux gardes protegent des ABSENCES, et ce sont les plus importants :
     - le Worker ne doit toujours PAS connaitre Supabase (sinon le §1 est faux) ;
     - la cle `service_role` ne doit JAMAIS apparaitre dans un fichier servi.

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
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'DOSSIER-GPT-IDEMPOTENCE-SUPABASE-15-09-2026.pdf')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


SB = lire('supabase.js')
SETUP = lire('setup.js')
WORKER = lire('worker.js')
LOG = lire('log.js')
SW = lire('sw.js')
ARCHIVE = lire(os.path.join('docs', 'JOURNAL-ARCHIVE.md'))
DOSSIER = lire(os.path.join('docs', 'IDEMPOTENCE-SUPABASE.md'))

VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]
g(VERSION.startswith('ft-v'), 'la version ne se lit plus dans sw.js')

# ── 1. [!!] LE FAIT QUI PORTE TOUT LE §1 : LE WORKER NE CONNAIT PAS SUPABASE ────────────────
g(len(re.findall(r'supabase|SUPABASE|SB_URL|SB_ANON', WORKER)) == 0,
  'worker.js mentionne desormais Supabase : le §1 affirme le contraire (0 occurrence), et toute '
  'la recommandation repose sur le fait que l\'acces serveur RESTE a creer')

# ── 2. L'ARCHITECTURE DU MIROIR, RELUE ─────────────────────────────────────────────────────
g("const SB_TABLE = 'ft_comptes'" in SB, 'la table du miroir n\'est plus ft_comptes')
g("const SB_FN = 'ft_miroir'" in SB, 'la fonction du miroir n\'est plus ft_miroir')
g('/rest/v1/rpc/' in SB, 'le miroir n\'appelle plus une RPC')
# [!] On exige l'ECRITURE SEULE : c'est la propriete qui rend le miroir sans danger aujourd'hui.
g('sb_publishable_' in SB or 'SB_ANON' in SB, 'la cle publiable a disparu de supabase.js')
g(re.search(r'service_role', SB) is not None and 'NE JAMAIS METTRE ICI' in SB,
  'l\'avertissement « ne jamais mettre la cle service_role ici » a disparu de supabase.js')

# [!!] GARDE DE SECURITE — une vraie cle service_role ne doit exister dans AUCUN fichier servi.
SERVIS_LISTE = ['supabase.js', 'app.js', 'setup.js', 'coach.js', 'log.js', 'screens.js',
                'state.js', 'tracking.js', 'constants.js', 'index.html', 'sw.js']
for f in SERVIS_LISTE:
    txt = lire(f)
    g(re.search(r'sb_secret_|service_role_key\s*=\s*[\'"]ey', txt) is None,
      'une cle SECRETE Supabase semble presente dans %s : elle contournerait RLS et donnerait un '
      'acces total a n\'importe quel visiteur' % f)

# ── 3. LE MIROIR EST APPELE AVEC LE PAYLOAD DE SAUVEGARDE, ET IL CONTIENT coachMemory ───────
g(re.search(r'sbMirror\(\s*_corpsSync\s*\)', SETUP) is not None,
  'sbMirror n\'est plus appele avec _corpsSync : le §2 repose sur le CONTENU de cet objet')
_i = SETUP.index('const _corpsSync=')
_bloc = SETUP[_i:_i + 3000]
for champ in ('coachMemory', 'registre', 'adn'):
    g(champ in _bloc,
      'le payload du miroir ne porte plus « %s » : le §2 affirme qu\'une caracterisation de la '
      'personne vit DEJA sur Supabase — sans ce champ, l\'argument tombe' % champ)

# ── 4. LA FAIBLESSE DE ft-v772, sur laquelle repose la recommandation ──────────────────────
g("l'e-mail de quelqu'un d'autre" in ARCHIVE,
  'la faiblesse documentee en ft-v772 (ecrire avec l\'e-mail d\'un autre) a disparu de '
  'l\'archive : c\'est la raison n°1 de la recommandation')
g('security definer' in ARCHIVE.lower(),
  'le motif security definer n\'est plus documente dans l\'archive')

# ── 5. L'IDENTIFIANT DE SEANCE EST UN HORODATAGE — donc ENUMERABLE (§5) ────────────────────
_sess = re.search(r'const sess=\{id:([^,]+),', LOG)
g(bool(_sess), 'la seance ne porte plus `id` en tete')
ID_EXPR = _sess.group(1).strip()
g(ID_EXPR == 'Date.now()',
  'l\'identifiant de seance n\'est plus `Date.now()` : le §5 explique qu\'il est ENUMERABLE '
  'precisement parce que c\'est un horodatage')

# ── 6. LE DOSSIER TIENT-IL SES ENGAGEMENTS ? ───────────────────────────────────────────────
g('AUDIT SEUL' in DOSSIER, 'le dossier n\'annonce plus qu\'il est un audit seul')
# [!!] LE GARDE EST ANCRE DANS LA SECTION COUT, PAS DANS LE DOCUMENT ENTIER. Ma premiere version
#      cherchait la phrase n'importe ou : or elle sert AUSSI de TITRE au §13, donc la retirer de
#      la section cout la laissait verte. *Un garde qui accepte un titre a la place du contenu
#      mesure la table des matieres.*
_D = DOSSIER.replace('É', 'E').replace('Â', 'A').replace('è', 'e').replace('û', 'u')
_m9 = re.search(r'^##\s*9\.\s*Cout.*?(?=^##\s)', _D, re.S | re.M)
g(bool(_m9), 'la section « Cout » a disparu du dossier')
g('VERIFIER DANS LE DASHBOARD SUPABASE' in _m9.group(0),
  'la section COUT n\'ecrit plus « a verifier dans le dashboard » la ou le prix n\'est pas '
  'connu : il inventerait un chiffre')
# [!] Deux faits, deux gardes (lecon de la passe precedente) : la fenetre residuelle doit etre
#     NOMMEE, et le SQL doit etre annonce comme NON execute.
g('non eliminable' in DOSSIER or 'non éliminable' in DOSSIER,
  'le dossier ne nomme plus la fenetre residuelle non eliminable (Anthropic repond, l\'ecriture '
  'echoue) : ce serait maquiller une deduplication en garantie')
g("n'a PAS ete execute" in DOSSIER or "n'a PAS été exécuté" in DOSSIER,
  'le dossier ne dit plus que le SQL propose n\'a pas ete execute')
g('AES-GCM' in DOSSIER and 'artisanal' in DOSSIER,
  'la variante chiffree ne renvoie plus a une primitive standard : Michel a ecrit « ne code aucun '
  'chiffrement artisanal »')

# ── 7. AUCUN FICHIER SERVI MODIFIE — l'audit l'affirme, on le VERIFIE ───────────────────────
SERVIS = set(SERVIS_LISTE) | {'worker.js', 'Code.js', 'style.css', 'wrangler.toml'}
try:
    _mod = subprocess.run(['git', 'diff', '--name-only', 'HEAD'], cwd=ROOT,
                          capture_output=True, text=True).stdout.split()
    _touche = sorted(SERVIS & set(_mod))
    g(not _touche, 'l\'audit annonce « aucun code servi modifie », or %s a change'
      % ', '.join(_touche))
except FileNotFoundError:
    pass

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
    'titre': ParagraphStyle('titre', parent=S['Title'], fontName='Helvetica-Bold',
                            fontSize=18, leading=22, textColor=ENCRE, alignment=TA_LEFT,
                            spaceAfter=2),
    'sous': ParagraphStyle('sous', parent=S['Normal'], fontName='Helvetica',
                           fontSize=9.5, leading=13, textColor=GRIS, spaceAfter=13),
    'h1': ParagraphStyle('h1', parent=S['Heading1'], fontName='Helvetica-Bold',
                         fontSize=12.5, leading=15.5, textColor=ROUGE, spaceBefore=13,
                         spaceAfter=5),
    'p': ParagraphStyle('p', parent=S['Normal'], fontName='Helvetica',
                        fontSize=9.3, leading=13.2, textColor=ENCRE, spaceAfter=6),
    'petit': ParagraphStyle('petit', parent=S['Normal'], fontName='Helvetica',
                            fontSize=8.2, leading=11.5, textColor=GRIS, spaceAfter=5),
    'cell': ParagraphStyle('cell', parent=S['Normal'], fontName='Helvetica',
                           fontSize=8.0, leading=10.4),
    'cellb': ParagraphStyle('cellb', parent=S['Normal'], fontName='Helvetica-Bold',
                            fontSize=8.0, leading=10.4),
    'code': ParagraphStyle('code', parent=S['Normal'], fontName='Courier',
                           fontSize=7.2, leading=9.2, textColor=ENCRE),
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
                  'Force Tracker - Supabase et l idempotence du debrief - audit - %s' % VERSION)
    cv.drawRightString(A4[0] - 22 * mm, 12 * mm, 'page %d' % cv.getPageNumber())
    cv.restoreState()


H = []
H.append(P('Supabase peut-il porter l idempotence du debrief ?', 'titre'))
H.append(P('Force Tracker &middot; audit du miroir existant &middot; 15/09/2026 &middot; %s '
           '&middot; <b>audit seul : aucune table, aucune RPC, aucune cle, aucun code servi</b>'
           % VERSION, 'sous'))

H.append(encadre('REPONSE A LA QUESTION FINALE',
                 '<b>OUI - techniquement Supabase est la meilleure des quatre options</b>, et de '
                 'loin : PostgreSQL est le seul a offrir une atomicite <b>prouvable en une seule '
                 'instruction</b>.<br/><br/>'
                 '[!] <b>Mais "Supabase existe deja" est en partie trompeur</b> : ce qui existe '
                 'est un chemin <b>navigateur vers Supabase, en ecriture seule</b>. '
                 'L idempotence demande un chemin <b>Worker vers Supabase</b>, qui <b>n existe '
                 'pas</b> : le Worker ne connait pas Supabase (<b>0 occurrence</b>, mesure) et il '
                 'faudra <b>une nouvelle cle serveur</b>.<br/><br/>'
                 '<i>Le projet existe ; l acces, lui, est a creer.</i>'))
H.append(Spacer(1, 6))

H.append(P('1. L architecture actuelle - lue, pas supposee', 'h1'))
H.append(tableau(['fait', 'source'],
                 [['table <b>ft_comptes</b>, fonction <b>ft_miroir(p_email, p_data)</b>', 'supabase.js'],
                  ['le <b>navigateur</b> appelle ' + (C % '/rest/v1/rpc/ft_miroir'), 'supabase.js'],
                  ['la cle publiee n a <b>AUCUN droit sur la table</b> - elle ne peut qu executer '
                   'la fonction, en <i>security definer</i>', 'supabase.js / ft-v772'],
                  ['<b>aucune lecture possible, par aucun chemin</b>', 'idem'],
                  ['<b>le Worker ne connait pas Supabase</b> - 0 occurrence', 'mesure'],
                  [(C % 'supabase.js') + ' est un fichier <b>frontend</b>, servi et mis en cache',
                   'index.html / sw.js']],
                 [112 * mm, 54 * mm]))
H.append(Spacer(1, 5))
H.append(encadre('UNE FAIBLESSE EST DEJA DOCUMENTEE - ET ELLE DECIDE DE LA RECOMMANDATION',
                 'ft-v772, noir sur blanc : <i>&laquo; n importe qui connaissant la cle publiee '
                 'peut appeler la fonction avec <b>l e-mail de quelqu un d autre</b> et ecraser sa '
                 'ligne miroir &raquo;</i>. C est sans gravite aujourd hui <b>parce qu on ne peut '
                 'rien LIRE</b>.<br/><br/>'
                 'Or <b>l idempotence exige de RELIRE un resultat</b>. Le jour ou une route rend '
                 'un contenu contre un identifiant, cette faiblesse cesse d etre theorique.', ORANGE))

H.append(P('2. Vie privee : la frontiere n est pas ou on la croyait', 'h1'))
H.append(P('La regle citee - <i>&laquo; le fil Milo reste uniquement sur le telephone &raquo;</i> - '
           'est vraie, et elle concerne ' + (C % 'ft4_coach_hist') + ', le fil brut, qui ne part '
           'effectivement nulle part.', 'p'))
H.append(P('[!] <b>Mais le miroir envoie deja bien plus qu on ne le croit.</b> Mesure dans '
           + (C % 'setup.js') + ', l objet exact passe a ' + (C % 'sbMirror') + ' contient : '
           + (C % 'registre') + ' (faits <b>et observations</b> sur la personne), '
           + (C % 'adn') + ', et surtout <b>' + (C % 'coachMemory') + '</b> - le resume durable '
           'que Milo ecrit <b>sur elle</b>.', 'p'))
H.append(P('Une caracterisation de la personne ecrite par Milo vit donc <b>DEJA en permanence</b> '
           'sur Supabase. Stocker un debrief <b>une heure</b> est un pas <b>plus petit</b> qu il n '
           'y parait - mais c en est un : le debrief est plus <b>granulaire</b>, et c est du '
           'contenu <b>nouveau</b>. <i>Ce n est pas un argument pour le faire : c est une '
           'correction de la premisse.</i>', 'p'))

H.append(P('3. Atomicite - la preuve technique', 'h1'))
H.append(P('<b>Oui, et c est le point fort de Postgres.</b> Un index ' + (C % 'UNIQUE(debrief_key)')
           + ' fait serialiser les insertions concurrentes <b>par le moteur lui-meme</b> : sur '
           '<b>5 requetes simultanees, exactement une</b> reussit. Il n y a <b>pas</b> de '
           + (C % 'SELECT') + ' puis ' + (C % 'INSERT') + ', donc <b>pas de fenetre de course</b>. '
           'Une seule instruction couvre les quatre etats :', 'p'))
H.append(tableau(['etat rencontre', 'ce qui se passe'],
                 [['<b>ABSENT</b>', 'la ligne est creee, l appelant est <b>proprietaire</b> - 1 appel IA'],
                  ['<b>IN_PROGRESS frais</b>', '0 ligne rendue : l appelant sait qu il n est PAS '
                   'proprietaire - <b>aucun appel Anthropic</b>'],
                  ['<b>IN_PROGRESS expire</b>', 'repris par <b>bail</b> - un seul repreneur'],
                  ['<b>COMPLETED</b>', 'le resultat est rendu - <b>0 appel</b>'],
                  ['<b>FAILED</b>', 'repris - <b>retry autorise</b>']],
                 [40 * mm, 126 * mm]))
H.append(Spacer(1, 4))
H.append(P('[!] <b>Le SQL propose n a PAS ete execute</b> - Supabase est injoignable depuis ce '
           'conteneur. <i>La primitive est certaine ; la formulation exacte reste a valider.</i> '
           'Et on ne part pas de zero : ' + (C % 'ft_miroir') + ' prouve que le motif '
           '<i>security definer</i> + RPC marche sur ce projet.', 'p'))

H.append(P('4. Securite : l identifiant ne peut pas etre la seance', 'h1'))
H.append(P('<b>' + (C % 'debriefId = "debrief:" + sess.id') + ' est un horodatage en millisecondes '
           '(' + (C % ID_EXPR) + ') : il est ENUMERABLE.</b> Si une route rend un contenu contre '
           'cet identifiant, deviner devient une attaque.', 'p'))
H.append(P('La reponse tient dans un secret que le Worker <b>a deja</b> : il derive lui-meme '
           + (C % 'debrief_key = HMAC(secret_serveur, email + ":" + sessionId)') + '. Le client ne '
           'voit jamais cette cle et ne peut pas la fabriquer ; deux tentatives pour la meme '
           'seance donnent la meme cle ; l enumeration disparait.', 'p'))
H.append(encadre('MAIS CA NE SUFFIT PAS, ET IL FAUT LE DIRE',
                 'Le Worker recoit ' + (C % 'email') + ' <b>du client</b>, sans authentification. '
                 'Quelqu un qui connait l adresse <b>et</b> la milliseconde d une seance pourrait '
                 'faire calculer la cle par le Worker. <b>C est la faiblesse de ft-v772 transposee '
                 '- sauf qu ici elle permettrait de LIRE.</b><br/><br/>'
                 'Seule la variante chiffree la referme.', ORANGE))

H.append(P('5. Confidentialite - les trois variantes', 'h1'))
H.append(tableau(['', 'securite', 'recup. apres reload', 'empeche le 2e appel', 'complexite'],
                 [['<b>A</b> - clair, TTL 1 h', 'faible', 'oui', 'oui', 'faible'],
                  ['<b>B</b> - chiffre par le client',
                   '<b>la base ne peut pas lire</b>', 'oui', 'oui', 'moyenne'],
                  ['<b>C</b> - etat seul, sans resultat', 'maximale', '<b>NON</b>', 'oui', 'faible']],
                 [46 * mm, 40 * mm, 28 * mm, 28 * mm, 24 * mm]))
H.append(Spacer(1, 4))
H.append(P('<b>B en pratique</b> : le client genere une cle par debrief (WebCrypto, <b>AES-GCM</b> '
           '- aucun chiffrement artisanal), la garde sur le telephone et l envoie avec la requete. '
           'Le Worker chiffre le resultat <b>avant</b> de l ecrire et <b>ne stocke jamais la cle</b>. '
           '<b>B n est pas seulement plus prive : c est le seul qui referme la faiblesse de '
           'ft-v772</b>, puisque meme en atteignant la ligne on n obtient rien de lisible. '
           '[!] Honnetete : le Worker voit le texte en clair de toute facon - B protege le '
           '<b>stockage</b>, pas le transit. C est precisement le sujet.', 'p'))

H.append(P('6. TTL, latence, cout', 'h1'))
H.append(P('<b>TTL</b> : la suppression <b>opportuniste</b> dans la RPC suffit et ne depend d '
           'aucune extension. ' + (C % 'pg_cron') + ' serait plus propre - <b>A VERIFIER DANS LE '
           'DASHBOARD SUPABASE</b>.', 'p'))
H.append(P('<b>Latence : NON MESUREE</b>, et je ne l invente pas - Supabase <b>et</b> Apps Script '
           'sont injoignables d ici. Sans mesure on peut seulement dire qu Apps Script ajoute un '
           'aller-retour web-app + un acces Sheet et que ' + (C % 'LockService') + ' <b>serialise</b> '
           '(donc la latence monte avec la concurrence), la ou Supabase fait une requete indexee '
           'avec l atomicite <b>dans le moteur</b>. <i>Ne pas conclure que Supabase est plus rapide '
           'parce que c est PostgreSQL</i> : a mesurer depuis le Worker deploye. <b>Les deux '
           'ajoutent un aller-retour sur le chemin critique.</b>', 'p'))
H.append(P('<b>Cout : A VERIFIER DANS LE DASHBOARD SUPABASE.</b> Le plan et les quotas ne sont pas '
           'visibles depuis le depot - aucun chiffre invente. Ce qui est certain : <b>1 a 2 '
           'requetes par debrief</b>, quelques Ko effaces au bout d une heure. Face a cela, un '
           'appel Sonnet evite vaut <b>environ 0,01 a 0,07 EUR</b>.', 'p'))

H.append(P('7. Resilience - les fenetres residuelles, nommees', 'h1'))
H.append(tableau(['cas', 'double appel ?'],
                 [['Supabase indisponible / timeout',
                   '[!] <b>OUI si on echoue "ouvert"</b> - c est le prix du "jamais de perte"'],
                  ['insertion reussie, reponse perdue', 'non'],
                  ['<b>Anthropic reussit, l ecriture COMPLETED echoue</b>',
                   '[!] <b>OUI - fenetre residuelle reelle, non eliminable</b>'],
                  ['IN_PROGRESS orphelin', 'non - repris apres expiration du bail'],
                  ['2 requetes simultanees', 'non - l index UNIQUE tranche'],
                  ['2 seances differentes', '2 appels <b>legitimes</b>']],
                 [78 * mm, 88 * mm]))
H.append(Spacer(1, 4))
H.append(P('<b>Deux fenetres restent, et aucune n est supprimable.</b> Les taire serait maquiller '
           'une deduplication en garantie.', 'p'))

H.append(P('8. Comparaison finale', 'h1'))
H.append(tableau(['', 'atomicite', 'latence', 'vie privee', 'nouveau cout', 'complexite'],
                 [['Apps Script + Sheet', 'LockService', '<b>la plus lourde</b>, serialisee',
                   'texte chez Google', '<b>0 EUR</b>', 'moyenne'],
                  ['<b>Supabase existant</b>', '<b>index UNIQUE - la plus forte</b>',
                   'a mesurer', 'A : texte / <b>B : illisible</b>', 'dashboard',
                   'moyenne + <b>1 cle serveur</b>'],
                  ['D1', 'oui', '?', 'idem', 'dashboard', '+ service a creer'],
                  ['Durable Objects', 'tres forte', '?', 'idem', '<b>plan</b>', 'la plus elevee']],
                 [32 * mm, 34 * mm, 30 * mm, 30 * mm, 20 * mm, 20 * mm]))

H.append(P('9. Recommandation', 'h1'))
H.append(encadre('SUPABASE, EN VARIANTE B (RESULTAT CHIFFRE COTE CLIENT), VIA LE WORKER',
                 '1. <b>c est le seul qui referme une faiblesse deja ecrite</b> (ft-v772) au lieu '
                 'de l etendre a la lecture ;<br/>'
                 '2. <b>l atomicite est dans le moteur</b>, prouvable, sans verrou applicatif ;<br/>'
                 '3. <b>le projet et le motif security definer existent deja</b> - on enrichit, on '
                 'ne cree pas.<br/><br/>'
                 '[!] <b>Mais ce n est pas "gratuit parce que Supabase existe"</b> : il faut une '
                 'table, une RPC, une policy, et surtout <b>une cle serveur dans le Worker</b> - '
                 'la seule chose que Michel a explicitement interdit d ajouter dans cette '
                 'passe.<br/><br/>'
                 'Et si Michel veut le geste le moins engageant : la <b>variante C</b> supprime le '
                 'double appel <b>sans rien stocker de personnel</b>, au prix du debrief perdu pour '
                 'cette seance-la. <i>C est le seul choix qui ne demande aucune decision de '
                 'confidentialite.</i>', VERT))

H.append(P('10. A verifier dans le dashboard Supabase', 'h1'))
H.append(P('<b>1.</b> Plan, consommation et limites gratuites. <b>2.</b> Etat reel des policies RLS '
           'de ' + (C % 'ft_comptes') + ' (le depot n en garde qu un recit). <b>3.</b> Existence d '
           'une cle privilegiee et possibilite d en creer une <b>restreinte</b> a la seule nouvelle '
           'RPC - elle ne devra <b>jamais</b> etre servie au navigateur. <b>4.</b> Disponibilite de '
           + (C % 'pg_cron') + '. <b>5.</b> Que le projet est bien <b>separe</b> de celui de '
           'Tatiana.', 'p'))
H.append(Spacer(1, 4))
H.append(P('<b>Ce que cette passe n a pas fait.</b> Aucune table, aucune RPC, aucune RLS, aucune '
           'cle, aucun deploiement, aucun code servi modifie, ' + (C % 'sw.js') + ' non incremente, '
           '<b>miroir intact</b>. Le SQL n a pas ete execute ; latence et cout ne sont pas mesures.',
           'p'))

H.append(Spacer(1, 6))
H.append(P('Ce PDF est genere par <font face="Courier">tools/gen_sb_pdf.py</font>, dont les %d '
           'gardes relisent chaque fait dans le depot et <b>refusent de produire</b> si un seul '
           'tombe. Les deux plus importants protegent des <b>absences</b> : que le Worker ne '
           'connaisse toujours pas Supabase, et qu aucune cle secrete n apparaisse dans un fichier '
           'servi.' % GARDES[0], 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - Supabase et l idempotence du debrief (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)
print('OK %s  (%s, %d gardes, worker-supabase=0, id=%s)' % (OUT, VERSION, GARDES[0], ID_EXPR))
