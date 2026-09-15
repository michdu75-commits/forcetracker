#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dossier GPT — PHASE 1ter, ETAPE 0 : l'infrastructure permet-elle une idempotence fiable ?
   (hors depot — regle d'or #14, le depot est public)

TOUS LES FAITS SONT RELUS DANS LE DEPOT A CHAQUE GENERATION : les bindings dans `wrangler.toml`,
les secrets dans `worker.js`, la limite des Script Properties et l'absence de LockService dans
`Code.js`, l'identifiant de seance dans `log.js`, la decision de confidentialite dans `coach.js`,
les tarifs dans `tests/milo/eval.js`.

[!!] Le garde le plus important protege une ABSENCE : ce document affirme qu'AUCUN stockage n'est
     configure. Le jour ou un binding apparait, il doit REFUSER de se produire.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji.
"""
import html
import os
import re
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
    SCRATCH, 'DOSSIER-GPT-IDEMPOTENCE-DEBRIEF-15-09-2026.pdf')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


WRANGLER = lire('wrangler.toml')
WORKER = lire('worker.js')
CODEJS = lire('Code.js')
LOG = lire('log.js')
COACH = lire('coach.js')
SW = lire('sw.js')
EVAL = lire(os.path.join('tests', 'milo', 'eval.js'))
DOSSIER = lire(os.path.join('docs', 'IDEMPOTENCE-DEBRIEF.md'))

VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]
g(VERSION.startswith('ft-v'), 'la version ne se lit plus dans sw.js')

# ── 1. [!!] LE FAIT CENTRAL : AUCUN BINDING DE STOCKAGE DANS wrangler.toml ──────────────────
for binding in ('kv_namespaces', 'd1_databases', 'durable_objects', 'r2_buckets',
                'hyperdrive', 'queues'):
    g(binding not in WRANGLER,
      'wrangler.toml declare desormais « %s » : un stockage EST configure, tout le verdict '
      'du document est perime — le relire avant de republier' % binding)
CLES_WRANGLER = sorted(set(re.findall(r'^\s*([a-z_]+)\s*=', WRANGLER, re.M)))
g(CLES_WRANGLER == ['account_id', 'compatibility_date', 'main', 'name'],
  'les cles de wrangler.toml ont change (%s) : le §2 les enumere' % ', '.join(CLES_WRANGLER))

SECRETS = sorted(set(re.findall(r'env\.([A-Za-z_0-9]+)', WORKER)))
g(SECRETS == ['ANTHROPIC_API_KEY', 'FT_COUNT_TOKEN'],
  'le Worker lit desormais d\'autres entrees de `env` (%s) : le document dit qu\'il n\'en a que 2'
  % ', '.join(SECRETS))

# ── 2. APPS SCRIPT : deja appele par le Worker, et LockService toujours inutilise ───────────
g('APPS_SCRIPT_URL' in WORKER,
  'le Worker n\'appelle plus Apps Script : l\'option 1 repose sur le fait qu\'il le fait deja')
g('LockService' not in CODEJS,
  'LockService est desormais employe dans Code.js : le §2 affirme qu\'il ne l\'est nulle part')
g('PropertiesService' in CODEJS, 'PropertiesService a disparu de Code.js')
_lim = re.search(r'limiteOctets:\s*(\d+)', CODEJS)
g(bool(_lim), 'la limite des Script Properties ne se lit plus dans Code.js')
LIMITE = int(_lim.group(1))
g(LIMITE == 512000, 'la limite des Script Properties n\'est plus 512 000 (%d)' % LIMITE)

# ── 3. L'IDENTIFIANT DE SEANCE EXISTE DEJA — c'est tout l'objectif 1 ────────────────────────
_sess = re.search(r'const sess=\{id:([^,]+),', LOG)
g(bool(_sess), 'la seance de finishWorkout ne porte plus `id` en tete : l\'objectif 1 reposait '
               'entierement sur son existence')
ID_EXPR = _sess.group(1).strip()
g(ID_EXPR == 'Date.now()',
  'l\'identifiant de seance n\'est plus `Date.now()` mais `%s` : l\'unicite a la milliseconde '
  'n\'est plus garantie, le scenario 11 (deux seances le meme jour) retombe' % ID_EXPR)
g(re.search(r'id:\s*now\s*\+\s*si', LOG) is not None,
  'les seances IMPORTEES ne recoivent plus d\'identifiant unique')

# ── 4. [!!] LA DECISION DE CONFIDENTIALITE — le vrai blocage du document ────────────────────
g('vit UNIQUEMENT sur le t' in COACH,
  'la phrase qui dit que le fil ne quitte pas le telephone a disparu de coach.js : c\'est le '
  'pivot du document, il faut le reecrire')
g("C'est un CHOIX de conception" in COACH,
  'coach.js ne presente plus cela comme un CHOIX : si c\'etait devenu un oubli, le §1 change')
g('ft4_coach_hist' in COACH, 'la cle locale du fil a change de nom')

# ── 5. TARIFS — lus, jamais retapes ────────────────────────────────────────────────────────
_t = re.search(r"prod\s*:\s*\{[^}]*entree:\s*([\d.]+)\s*,\s*sortie:\s*([\d.]+)", EVAL)
g(bool(_t), 'les tarifs Sonnet ne se lisent plus dans tests/milo/eval.js')
T_IN, T_OUT = _t.group(1), _t.group(2)

# ── 6. LE DOSSIER DIT-IL BIEN QU'ON S'ARRETE ? ─────────────────────────────────────────────
g('ARR' in DOSSIER and 'AVANT CODAGE' in DOSSIER,
  'le dossier n\'annonce plus l\'arret avant codage')
for interdit in ('KV', 'atomique'):
    g(interdit in DOSSIER, 'le dossier ne parle plus de « %s »' % interdit)
# [!] Le garde qui protege la NUANCE : KV ne doit jamais etre presente comme fiable.
for m in re.finditer(r'KV', DOSSIER):
    seg = DOSSIER[m.start():m.start() + 320]
    if 'atomique' in seg or 'ecarter' in seg or 'refuser' in seg or 'compare-and-set' in seg:
        break
else:
    g(False, 'le dossier ne dit plus nulle part que KV n\'est pas atomique : ce serait '
             'exactement la « deduplication approximative maquillee en idempotence »')

# ── 7. AUCUN FICHIER SERVI MODIFIE : le dossier l'affirme, on le VERIFIE ────────────────────
import subprocess
SERVIS = {'app.js', 'log.js', 'coach.js', 'setup.js', 'screens.js', 'state.js', 'tracking.js',
          'constants.js', 'index.html', 'style.css', 'sw.js', 'worker.js', 'Code.js',
          'wrangler.toml'}
try:
    _mod = subprocess.run(['git', 'diff', '--name-only', 'HEAD'], cwd=ROOT,
                          capture_output=True, text=True).stdout.split()
    _touche = sorted(SERVIS & set(_mod))
    g(not _touche, 'le dossier annonce « aucun fichier servi modifie », or %s a change'
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
                           fontSize=8.1, leading=10.6),
    'cellb': ParagraphStyle('cellb', parent=S['Normal'], fontName='Helvetica-Bold',
                            fontSize=8.1, leading=10.6),
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
                  'Force Tracker - phase 1ter - etape 0 - idempotence du debrief - %s' % VERSION)
    cv.drawRightString(A4[0] - 22 * mm, 12 * mm, 'page %d' % cv.getPageNumber())
    cv.restoreState()


H = []
H.append(P('L\'infrastructure permet-elle une idempotence serveur fiable ?', 'titre'))
H.append(P('Force Tracker &middot; phase 1ter, etape 0 du chantier Debrief Milo &middot; '
           '15/09/2026 &middot; %s &middot; <b>inventaire seul, arret avant codage</b>' % VERSION,
           'sous'))

H.append(encadre('LE VERDICT - ET IL NE TIENT PAS A CE QU ON CROYAIT',
                 '<b>Aucun stockage serveur n est configure cote Cloudflare</b> : '
                 + (C % 'wrangler.toml') + ' declare <b>zero binding</b> (ses seules cles sont '
                 + (C % 'name, main, account_id, compatibility_date') + ') et le Worker ne lit '
                 'que <b>deux secrets</b>.<br/><br/>'
                 '<b>Mais ce n est pas le vrai blocage.</b> Pour tenir A LA FOIS "un seul appel '
                 'IA" et "jamais de perte", le RESULTAT doit survivre a la disparition du client. '
                 'Le Worker est sans etat. <b>Donc le resultat doit etre stocke cote serveur</b> '
                 '- et c est la qu une decision deja prise par le projet se met en travers.'))
H.append(Spacer(1, 6))

H.append(P('1. Le vrai blocage n est pas technique', 'h1'))
H.append(P('Lu dans ' + (C % 'coach.js') + ' : <i>&laquo; Le fil des echanges vit UNIQUEMENT sur '
           'le telephone - il ne part ni chez Google, ni sur le Drive, ni chez Supabase. '
           '<b>C est un CHOIX de conception</b> - les gens parlent a Milo de leur corps, de leur '
           'moral, de leurs blessures - pas un oubli. &raquo;</i>', 'p'))
H.append(P('Un debrief est un texte de Milo <b>sur l entrainement d une personne nommee</b>. Le '
           'persister cote serveur, meme une heure, est une <b>decision produit</b> : elle '
           'appartient a Michel, pas a moi.', 'p'))
H.append(encadre('ET L ALTERNATIVE "NE STOCKER QUE L ETAT" NE MARCHE PAS',
                 'Elle empeche bien le 2e appel, mais le client recharge n a alors <b>rien a '
                 'afficher</b> : on remplace un doublon couteux par la <b>perte silencieuse</b> '
                 'que Michel interdit explicitement.<br/><br/>'
                 '<i>Les deux moities du probleme se tiennent : on ne peut pas resoudre l une '
                 'sans payer l autre.</i>', ORANGE))

H.append(P('2. L inventaire, dans les trois categories demandees', 'h1'))
H.append(P('<b>A - Disponible ET deja configure</b>', 'p'))
H.append(tableau(['mecanisme', 'etat reel', 'atomique ?'],
                 [['<b>Apps Script</b> (deja appele par le Worker a chaque action IA)', 'actif', '-'],
                  ['&bull; ' + (C % 'LockService'),
                   'disponible sans configuration, <b>employe nulle part</b> aujourd hui',
                   '<b>OUI</b> - vraie exclusion mutuelle'],
                  ['&bull; ' + (C % 'PropertiesService'),
                   'actif, limite lue dans le code : <b>%s octets</b>' % '{:,}'.format(LIMITE).replace(',', ' '),
                   'oui, sous verrou'],
                  ['&bull; <b>Google Sheet</b> (5 onglets deja en ecriture)',
                   'actif, pas de plafond a 512 Ko', 'oui, sous verrou'],
                  ['Cache API du Worker', 'disponible, zero configuration',
                   '<b>NON</b> - par centre de donnees'],
                  [(C % 'localStorage') + ' client', 'actif (ft-v1215)',
                   'ne traverse pas un rechargement en vol']],
                 [58 * mm, 62 * mm, 46 * mm]))
H.append(Spacer(1, 5))
H.append(encadre('LES SCRIPT PROPERTIES SONT UNE RESSOURCE DEJA SATUREE UNE FOIS',
                 'Le 29/07/2026 elles sont montees a <b>102 %%</b> de leurs %s octets et '
                 '<b>plus aucune ecriture ne passait pendant deux jours, en silence</b>. Tous les '
                 'comptes utilisateurs y vivent. <i>Y ecrire des debriefs serait exactement le '
                 'geste qui a produit la panne</i> - si Apps Script est retenu, le resultat va '
                 'dans le <b>Sheet</b>.'
                 % '{:,}'.format(LIMITE).replace(',', ' '), ORANGE))
H.append(Spacer(1, 5))

H.append(P('<b>B - Techniquement possible mais NON configure</b> : KV, D1, Durable Objects, R2. '
           'Aucun n est declare. Chacun demande : creer la ressource, ajouter le binding, '
           'redeployer.', 'p'))
H.append(tableau(['', 'atomicite reelle', 'verdict pour une idempotence'],
                 [['<b>Durable Objects</b>', 'mono-thread par objet - <b>la primitive ideale</b>',
                   'le meilleur techniquement'],
                  ['<b>D1</b>', 'contrainte UNIQUE + INSERT ... ON CONFLICT', 'correct'],
                  ['<b>KV</b>', '<b>pas de compare-and-set</b>, coherence eventuelle',
                   '<b>A REFUSER</b> - ce serait la "deduplication approximative maquillee en '
                   'idempotence"'],
                  ['Cache API', 'par centre de donnees, eviction libre', 'a refuser']],
                 [30 * mm, 66 * mm, 70 * mm]))
H.append(Spacer(1, 5))
H.append(encadre('C - NOUVEAU SERVICE / NOUVEAU COUT : JE NE PEUX PAS TRANCHER, ET JE NE L INVENTE PAS',
                 'Les documentations Cloudflare sont <b>injoignables depuis ce conteneur</b> '
                 '(refus du proxy). Je n ai donc aucune source verifiable pour les limites '
                 'gratuites de KV/D1/R2, <b>ni pour savoir si les Durable Objects exigent un plan '
                 'payant</b> sur ce compte.<br/><br/>'
                 '<i>Un tarif ne se devine pas, il se lit sur la facture.</i> A verifier par '
                 'Michel dans son tableau de bord. Le seul chiffre du depot est le quota '
                 '<b>Workers</b> (100 000 requetes/jour) : il ne dit rien du stockage.'))

H.append(P('3. Une bonne nouvelle : l identifiant demande existe deja', 'h1'))
H.append(P('Mesure dans ' + (C % 'log.js') + ' : toute seance porte deja '
           + (C % 'id: %s' % ID_EXPR) + ', et les seances <b>importees</b> aussi.', 'p'))
H.append(tableau(['exigence de Michel', (C % 'sess.id')],
                 [['stable apres rechargement / fermeture', 'oui - persiste en localStorage'],
                  ['distinct entre deux seances du meme jour', '<b>oui - la milliseconde</b>'],
                  ['independant du libelle humain, de la date seule', 'oui'],
                  ['independant du nb d exercices, du volume', 'oui']],
                 [86 * mm, 80 * mm]))
H.append(Spacer(1, 4))
H.append(P('Le schema ne demande donc <b>aucun mecanisme nouveau</b> : ' + (C % 'sessionId = sess.id')
           + ' &middot; ' + (C % 'debriefId = "debrief:" + sess.id') + ' &middot; '
           + (C % 'requestId') + ' par tentative reseau (a creer cote client). <b>La designation '
           'humaine n est PAS la cle</b> - c est le defaut mesure en 1bis, ou deux seances '
           'identiques le meme jour partageaient leur designation.', 'p'))

H.append(P('4. Les options, avec leur prix', 'h1'))
H.append(tableau(['', 'fiabilite', 'cout EUR', 'impact architecture'],
                 [['<b>1. Apps Script + LockService + Sheet</b>', '<b>atomique</b>', '<b>0</b> (deja paye)',
                   'aller-retour <b>BLOQUANT</b> sur le chemin critique &middot; stocke du texte '
                   'personnel cote serveur'],
                  ['<b>2. D1</b>', 'atomique', 'a verifier', 'service a creer + binding + redeploiement'],
                  ['<b>3. Durable Objects</b>', 'la meilleure', '<b>plan a verifier</b>',
                   'idem + dependance a un plan'],
                  ['4. KV', '<b>non atomique</b>', 'a verifier', '<b>a ecarter</b>'],
                  ['5. Rien cote serveur', '-', '0',
                   '<b>interdit par sa propre contrainte</b> : empeche le 2e appel en PERDANT le debrief']],
                 [46 * mm, 24 * mm, 24 * mm, 72 * mm]))
H.append(Spacer(1, 5))
H.append(P('[!] <b>Le cout de l option 1 n est pas financier, il est en LATENCE.</b> Aujourd hui le '
           'seul appel Apps Script du Worker est sous ' + (C % 'ctx.waitUntil') + ' - donc '
           '<b>invisible</b> pour la personne. Une verification d idempotence, elle, est <b>sur le '
           'chemin critique</b>. Non mesurable d ici (Apps Script est bloque par le proxy) : a '
           'mesurer avant de s engager.', 'p'))

H.append(P('5. Le cout du remede face a l economie', 'h1'))
H.append(P('Tarifs lus dans ' + (C % 'tests/milo/eval.js') + ' (Sonnet : <b>%s</b> $/M en entree, '
           '<b>%s</b> $/M en sortie) appliques aux tailles <b>mesurees</b> en 1bis '
           '(79 272 octets de charge utile, soit ~20 000-22 000 jetons d entree) : un appel evite '
           'vaut <b>environ 0,01 a 0,07 EUR</b> selon le taux de cache. [!] <b>C est une estimation '
           'a partir d octets, pas une facture</b> - le chiffre reel est lisible dans '
           'Profil &gt; Admin &gt; Sante du systeme.' % (T_IN, T_OUT), 'p'))
H.append(P('Le remede, lui, coute <b>0 EUR</b> en option 1 (Apps Script est deja en service et deja '
           'appele). <b>Economiquement l option 1 gagne sans discussion</b> : on ne depense pas '
           '0,02 EUR d infrastructure pour eviter 0,01 EUR d IA, on n en depense aucune. '
           '<i>Le prix a payer n est pas de l argent : c est de la latence et une ligne de '
           'confidentialite.</i>', 'p'))

H.append(P('6. Ce qui se ferait sans rien ajouter - et ce que ca ne couvre pas', 'h1'))
H.append(P('Si Michel refuse le stockage serveur du texte, il reste un lot <b>borne et gratuit</b> : '
           'les identifiants transmis explicitement (' + (C % 'debriefId') + ', '
           + (C % 'requestId') + ', ' + (C % 'requestKind = "session_debrief"') + ') sans deduire '
           'le debrief en analysant une phrase du prompt ; le Worker cesse d etre aveugle ; et '
           'surtout <b>le quota peut etre debite par debriefId</b> et non par requete, puisque le '
           'compteur vit deja dans Apps Script.', 'p'))
H.append(encadre('MAIS LE 2e APPEL MODELE N EST PAS EMPECHE',
                 'Sans resultat persiste, le client recharge n a d autre choix que de redemander.'
                 '<br/><br/><b>On peut faire cesser la double consommation de QUOTA sans rien '
                 'stocker ; on ne peut pas faire cesser le double appel MODELE sans stocker le '
                 'resultat.</b> Ce sont deux decisions separees, et la seconde seule touche a la '
                 'vie privee.', VERT))

H.append(P('7. Ce que Michel doit trancher', 'h1'))
H.append(P('<b>1.</b> Accepte-t-on de persister le <b>texte</b> d un debrief cote serveur (duree '
           'courte, p. ex. 1 h, puis effacement) pour ne plus payer deux fois ? C est une '
           'exception a <i>&laquo; le fil ne quitte jamais le telephone &raquo;</i>. <b>Sans ce feu '
           'vert, le double appel modele ne peut pas etre supprime.</b>', 'p'))
H.append(P('<b>2.</b> Si oui : <b>Apps Script</b> (0 EUR, deja la, atomique, mais latence) ou '
           '<b>D1 / Durable Objects</b> (plus propre, coût et plan <b>a verifier par lui</b>) ?', 'p'))
H.append(P('<b>3.</b> Si non : veut-il quand meme le lot gratuit du §6 - identifiants explicites '
           'et <b>quota debite une seule fois par debrief logique</b> - en acceptant que le 2e '
           'appel modele subsiste ?', 'p'))
H.append(Spacer(1, 4))
H.append(P('<b>Ce que cette passe ne fait pas.</b> Aucun code, aucun fichier servi modifie, '
           + (C % 'sw.js') + ' non incremente, aucun test, aucune mutation, aucune passe - '
           'l arret est demande avant cette etape. Les 17 scenarios, le test a 5 requetes '
           'concurrentes et l avant/apres ne sont pas joues : ils n ont pas de sens tant que le '
           'mecanisme n est pas choisi. Le chemin Coach n est pas touche.', 'p'))

H.append(Spacer(1, 6))
H.append(P('Ce PDF est genere par <font face="Courier">tools/gen_1ter_pdf.py</font>, dont les %d '
           'gardes relisent chaque fait dans le depot et <b>refusent de produire</b> si un seul '
           'tombe - a commencer par le plus important, qui protege une <b>absence</b> : le jour ou '
           'un binding de stockage apparait dans <font face="Courier">wrangler.toml</font>, tout '
           'le verdict de ce document est perime et il ne sortira plus.' % GARDES[0], 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - idempotence du debrief, etape 0 (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)
print('OK %s  (%s, %d gardes, bindings=%d, secrets=%d, id=%s)'
      % (OUT, VERSION, GARDES[0], 0, len(SECRETS), ID_EXPR))
