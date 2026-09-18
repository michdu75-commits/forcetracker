#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B — DIAGNOSTIC DE DECISION : quel est le chemin de test reel le plus simple ?

[!!] LES TOTAUX SE LISENT DANS LEUR JOURNAL, JAMAIS A LA MAIN. Lecon de ft-v1201, ou un PDF
     a publie un total pendant que la passe tournait encore. Ici les deux chiffres (banc et
     mutations) sont EXTRAITS de /tmp/banc_s2b.log et /tmp/mut_s2b.log, et le generateur
     refuse de produire si la ligne de total manque ou si le banc n'a pas fini.

[!!] IL REFUSE AUSSI DE PRODUIRE SI V2 N'EST PLUS OUVERTE, ou si une migration pretendait
     toucher ft_comptes / ft_miroir. >> Un dossier qui decrit un etat qu'il n'a pas verifie
     se perime en silence.

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
    SCRATCH, 'S2B-CHEMIN-DE-TEST-REEL-18-09-2026.pdf')
LOG_ACCES = os.environ.get('FT_LOG_ACCES') or '/tmp/diag_acces.log'


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


def sans_sql_commentaires(src):
    """Retire les `-- ...` mais garde les chaines. Sans ca, une garde mesurerait la
    DOCUMENTATION de la migration au lieu de ses instructions."""
    out = []
    for ligne in src.split('\n'):
        i, n, dans = 0, len(ligne), None
        coupe = None
        while i < n:
            c = ligne[i]
            if dans:
                if c == dans:
                    dans = None
            elif c in '\'"':
                dans = c
            elif c == '-' and i + 1 < n and ligne[i + 1] == '-':
                coupe = i
                break
            i += 1
        out.append(ligne if coupe is None else ligne[:coupe])
    return '\n'.join(out)


SB = sans_commentaires(lire('supabase.js'))
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]
g(re.match(r'^ft-v\d+$', VERSION or ''), 'la version servie n a pas pu etre lue dans sw.js')

# ═══════════════════════════════════════════════════════════════════════════════════════
# I. MESURES
# ═══════════════════════════════════════════════════════════════════════════════════════


g('p_email: email' in SB, 'le client n envoie plus un p_email libre : V2 serait fermee')
W = lire('worker.js'); WC = sans_commentaires(W)
CO = sans_commentaires(lire('constants.js'))

# [!!] UN PLANTAGE N'EST PAS UNE GARDE. Ma premiere version faisait `.group(1)` sans filet :
#      quand l'URL disparaissait, le generateur mourait sur une erreur Python au lieu de dire
#      CE QUI manquait. *Une sortie en erreur ressemble a une garde rouge sans en etre une —
#      elle ne nomme pas le defaut.*
_hu = re.search(r"AI_PROXY_URL\s*=\s*'https://([a-z0-9.\-]+)'", CO)
g(_hu is not None,
  'l URL du Worker est introuvable dans constants.js : ce document en donne le mode d emploi')
HOTE = _hu.group(1)
g("body.action === 'cloudSave'" in WC, 'la route de sauvegarde a disparu du Worker')

# ⭐⭐ LA GARDE LA PLUS IMPORTANTE DE CE DOSSIER. Le test propose a Michel repose sur UN
#     detail : l injecteur de constants.js n ecrase JAMAIS un jeton deja pose. Si cette
#     condition disparaissait, le bout de code du §D enverrait son VRAI jeton — donc ecrirait
#     dans SON compte, ce que ce document promet explicitement de ne pas faire.
INJECTEUR_SUR = ('if(o && typeof o==="object" && !o.token)' in CO.replace("'", '"')
                 .replace(' ', '').replace('if(o&&typeofo=="object"&&!o.token)',
                                           'if(o && typeof o=="object" && !o.token)')
                 or re.search(r'&&\s*!o\.token\s*\)', CO) is not None)
g(INJECTEUR_SUR,
  'l injecteur de jeton ecrase desormais un jeton fourni : le test propose enverrait le VRAI '
  'jeton de Michel et ecrirait dans son compte — ce document promet le contraire')

WF = open(os.path.join(ROOT, '.github', 'workflows', 'deploy-worker.yml'), encoding='utf-8').read()
g("- 'worker.js'" in WF and 'wrangler-action' in WF, 'le deploiement automatique a disparu')
SHA = '304ef728'
import subprocess as _sp
g(_sp.run(['git', 'log', '--oneline', SHA + '..HEAD', '--', 'worker.js'], cwd=ROOT,
          capture_output=True, text=True).stdout.strip() == '',
  'un commit a touche worker.js depuis %s : le SHA annonce serait perime' % SHA)

g(os.path.exists(LOG_ACCES), 'le journal des mesures d acces est introuvable')
ACC = open(LOG_ACCES, encoding='utf-8', errors='replace').read()
CAUSE = 'Host not in allowlist'
for _m, _p in ((CAUSE, 'la cause nommee'), ('CONNECT tunnel failed', 'le refus du mandataire'),
               ('ERR_TUNNEL_CONNECTION_FAILED', 'la mesure au navigateur'),
               ('resolution OK', 'la resolution DNS'), (HOTE, 'le meme hote que le depot')):
    g(_m in ACC, 'le journal ne porte plus %s' % _p)
_plat = ACC.replace('"', '').replace("'", '').replace(' ', '').lower()
for _s in ('status:error', 'status:ok', 'error:origin', 'error:auth', 'accesrefuse'):
    g(_s not in _plat,
      'le journal contient une reponse du Worker (« %s ») : aucune requete ne l a atteint' % _s)

# le bout de code propose : il doit etre inoffensif, et ca se verifie
JETON_FACTICE = '0' * 64
SNIPPET = ("fetch(AI_PROXY_URL, { method:'POST',\n"
           "  headers:{ 'Content-Type':'application/json' },\n"
           "  body: JSON.stringify({ action:'cloudSave',\n"
           "                         token:'" + JETON_FACTICE + "',\n"
           "                         data:{ essai:true } })\n"
           "}).then(async r => console.log(r.status, await r.text()));")
g(re.fullmatch(r'[0-9a-f]{64}', JETON_FACTICE),
  'le jeton du test n est pas de la forme attendue : il serait refuse pour la mauvaise raison')
g("token:'" in SNIPPET, 'le test ne pose pas de jeton : l injecteur y mettrait le VRAI')
g('_ftToken' not in SNIPPET and 'localStorage' not in SNIPPET,
  'le test lit le vrai jeton : il ecrirait dans un compte reel')
g('email' not in SNIPPET, 'le test envoie une adresse : ce serait V2 reintroduite dans le test')

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


C = '<font face="Courier" size="7.2">%s</font>'


def bloc_code(txt, depuis=None):
    """⭐ `depuis` : le fichier dont chaque ligne NON VIDE doit provenir mot pour mot.
    Sans ca, un extrait du PDF pourrait diverger du fichier versionne — c'est-a-dire
    exactement la dette qu'on repare."""
    if depuis:
        src = SRC[depuis]
        for l in txt.split('\n'):
            if l.strip() and not l.strip().startswith('...'):
                g(l.strip() in src,
                  'l extrait cite une ligne absente de %s : « %s »' % (depuis, l.strip()[:70]))
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


OUI, NON, PART, AVER = ('<b>OUI</b>', '<b>NON</b>', '<b>PARTIEL</b>', '<b>A VERIFIER</b>')


H = []
# @@DEBUT@@
H.append(P('S2-B - quel est le chemin de test reel le plus simple ?', 'titre'))
H.append(P('Force Tracker - 18 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>aucune modification, aucun code, aucun bouton</b>', 'sous'))

H.append(encadre(
    'LA QUESTION, ET L ORDRE DANS LEQUEL ELLE SE POSE',
    'Avant d ajouter quoi que ce soit au produit, on cherche le moyen le plus simple de '
    'prouver <b>en reseau reel</b> que la nouvelle route fonctionne. Trois pistes, dans cet '
    'ordre : <b>(1)</b> autoriser proprement l hote dans l environnement de test, '
    '<b>(2)</b> un essai ponctuel depuis le navigateur de Michel, <b>(3)</b> un outil dans '
    'l application - <i>et seulement si les deux premieres ne suffisent pas</i>.'))

H.append(P('A - Autorisation reseau', 'h1'))
H.append(tableau(
    ['', ''],
    [['hote configurable ?', OUI],
     ['par qui ?', '<b>Michel</b> - c est un reglage d <b>environnement</b>, cote claude.ai. '
      '<b>Pas moi</b> : mesure, aucun reglage reseau n existe dans la configuration du '
      'conteneur, la politique est appliquee en amont'],
     ['chemin exact', 'lu dans la documentation officielle, <b>pas devine</b> - voir '
      'ci-dessous'],
     ['un seul hote suffit ?', OUI + ' - une ligne vaut un hote exact ; le prefixe generique '
      'ne sert qu aux sous-domaines. <b>Pas besoin d ouvrir tout un domaine.</b>']],
    [40 * mm, 126 * mm]))
H.append(bloc_code(
    "claude.ai/code\n"
    "  -> l'icone NUAGE portant le nom de l'environnement,\n"
    "     dans la rangee AU-DESSUS de la zone de message\n"
    "     (il n'existe ni page de reglages ni URL directe)\n"
    "  -> survoler l'environnement -> icone REGLAGES a droite\n"
    "  -> champ « Network access » : passer de « Trusted » a « Custom »\n"
    "  -> champ « Allowed domains », une seule ligne :\n"
    "     " + HOTE + "\n"
    "  -> COCHER « Also include default list of common package managers »"))
H.append(encadre(
    'LA CASE A COCHER N EST PAS UN DETAIL',
    'Sans elle, la liste devient <b>exclusive</b> : la session n aurait plus acces qu a cet '
    'hote, et perdrait GitHub, les registres de paquets, tout le reste. <b>Elle cesserait de '
    'fonctionner.</b> >> C est le genre de reglage ou l erreur ne se voit pas au moment ou on '
    'la fait, mais au premier travail suivant.'))
H.append(P('<b>Ce que je ne sais pas</b>, et qui se mesurera en relancant l essai : si le '
           'changement s applique a la session en cours ou seulement aux suivantes.', 'petit'))

H.append(P('B - Etat reel du Worker', 'h1'))
H.append(tableau(
    ['', ''],
    [['workflow', C % '.github/workflows/deploy-worker.yml'],
     ['dernier run', '<b>n°29</b>, 17/09 13h38 UTC, conclusion <b>succes</b>'],
     ['SHA deploye', (C % SHA) + ' - <b>re-mesure</b> : aucun commit n a touche le fichier du '
      'Worker depuis'],
     ['route de sauvegarde presente', OUI + ' dans ce SHA'],
     ['secrets requis presents', AVER + ' - <b>je ne peux pas le mesurer</b> : Cloudflare est '
      'hors de portee. Michel a releve quatre entrees aux bons noms. <i>C est son releve, pas '
      'ma mesure, et la difference compte.</i>']],
    [44 * mm, 122 * mm]))

H.append(PageBreak())
H.append(P('C - Test externe depuis mon environnement', 'h1'))
H.append(P('<b>Possible maintenant : NON.</b> Re-mesure a l instant, inchange. Trois clients, '
           'trois refus au meme endroit - en ligne de commande a travers le mandataire, en '
           'direct sans mandataire, et depuis un vrai navigateur sans interface. Le nom de '
           'domaine, lui, resout normalement.', 'p'))
H.append(bloc_code('HTTP 403\n' + CAUSE + ' : ' + HOTE))
H.append(P('<b>Cause technique exacte</b> : la liste d autorisation reseau de ma session. '
           '<b>Ce n est pas le filtre d origine</b>, et ce n est pas une protection du '
           'Worker.', 'p'))

H.append(P('D - Essai depuis le navigateur de Michel', 'h1'))
H.append(P('<b>Possible sans modifier le produit : OUI</b> - et, ce qui compte davantage, '
           '<b>sans ecrire une seule ligne</b> nulle part.', 'p'))
H.append(encadre(
    'POURQUOI SURTOUT PAS AVEC SON VRAI JETON',
    'Son jeton designe <b>son</b> compte. L essai ecrirait donc dans <b>sa propre ligne</b> de '
    'sauvegarde - un compte reel. C est exactement ce que la consigne interdit. '
    '>> <b>On envoie donc un jeton bien forme mais inconnu</b> : il est refuse par la base '
    '<b>et</b> par le pont, donc rien n est inscrit, rien n est ecrit. '
    'Et le vrai jeton n est pas envoye non plus : l injecteur de l application n ecrase '
    'jamais un jeton deja pose - <b>verifie dans le code, et une garde de ce generateur '
    'refuse de produire si cette condition disparaissait</b>.'))
H.append(P('A coller dans la console du navigateur, <b>sur le vrai site</b> :', 'p'))
H.append(bloc_code(SNIPPET))
H.append(P('<b>Ce que la reponse dit, a elle seule :</b>', 'p'))
H.append(tableau(
    ['reponse', 'ce que ca signifie'],
    [['<b>401</b> refus d identite',
      '<b>le meilleur resultat</b> : route atteinte, filtre d origine franchi, secrets vus, '
      'base et pont joignables, et tout refuse correctement'],
     ['<b>503</b> cloud indisponible / configuration',
      'route atteinte, mais <b>les secrets ne sont pas vus</b> par le Worker'],
     ['<b>403</b> origine', 'ne devrait pas arriver depuis le site lui-meme'],
     ['autre chose, ou du HTML', 'la route n est pas atteinte']],
    [46 * mm, 120 * mm]))
H.append(P('<b>Risque : nul.</b> Aucune ecriture, aucun secret expose, rien de persistant, une '
           'seule requete. <b>Retour arriere sans objet</b> - il n y a rien a defaire. '
           '<b>Limite</b> : le navigateur fixe lui-meme l origine, donc <b>seul le cas '
           '« bonne origine » est testable ainsi</b>. Les deux autres - origine absente, '
           'origine fausse - exigent un client externe, donc l autorisation du point A.', 'p'))

H.append(P('E - Bouton dans l application', 'h1'))
H.append(tableau(
    ['', '', ''],
    [['necessaire maintenant', NON,
      'le point D suffit pour la preuve immediate, le point A pour tout le reste'],
     ['utile a long terme', OUI + ' <i>probablement</i>',
      'diagnostic reutilisable, vrai contexte de l application installee, vraie pose du jeton - '
      'rien de cela ne se simule en ligne de commande'],
     ['mais alors', '<b>c est une fonctionnalite</b>',
      'donc regle d or #11 : point rouge, aide, documentation, decision de Michel. '
      '<b>Pas pour passer un essai ponctuel.</b>']],
    [38 * mm, 34 * mm, 94 * mm]))

H.append(P('Ce que je recommande', 'h1'))
H.append(P('<b>1.</b> Michel autorise l hote (point A) - je refais alors les trois cas '
           'd origine <b>et</b> tout le niveau reseau d ici, sans rien ajouter au produit. '
           '<b>2.</b> S il prefere ne pas toucher a l environnement, l essai du point D, une '
           'ligne a coller, zero ecriture. <b>3.</b> Le bouton seulement s il le veut pour '
           'lui-meme, et alors comme une vraie fonctionnalite.', 'p'))
H.append(P('Document produit par ' + str(GARDES[0]) + ' gardes qui relisent le code servi '
           + VERSION + ', le workflow de deploiement et le journal des mesures. Il refuse de '
           'produire si une mesure manque, si une reponse du Worker apparaissait dans ce '
           'journal, si le SHA annonce etait perime, si V2 n etait plus ouverte - ou si '
           'l injecteur cessait de proteger le vrai jeton.', 'petit'))
# @@FIN@@

TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()
_rendu = (TOUT + ' ' + ' '.join(CODES)).lower()
g('sb_publishable' not in _rendu and 'supabase.co' not in _rendu, 'une cle ou une URL apparait')
for m in re.finditer(r'[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}', _rendu):
    g(False, 'une adresse e-mail apparait : %s' % m.group(0))
for _i in ('service_role', 'secret key', 'sb_secret', 'anthropic_api_key'):
    g(_i not in _rendu, 'le document nomme un justificatif serveur (« %s »)' % _i)


def _mentionnee(txt, i):
    o = txt.rfind('«', 0, i)
    return o >= 0 and txt.find('»', o) > i


INTERDITS = [
    (r'le test a ete fait|la requete a atteint le worker|le worker a repondu',
     'le document AFFIRME un test qui n a pas eu lieu'),
    (r"le filtre d origine empeche|l origine rend le test impossible",
     'le document rattribue le blocage au filtre d origine'),
    (r'v2 est (desormais )?fermee', 'le document AFFIRME que V2 est fermee'),
    (r'un bouton est necessaire|le bouton est indispensable',
     'le document contredit son propre verdict sur le bouton'),
    (r'cet essai ecrit|une ecriture aura lieu',
     'le document annonce une ecriture : l essai propose n en fait aucune'),
]
for _bloc in TEXTES:
    _b = _bloc.lower()
    for _mot, _msg in INTERDITS:
        for m in re.finditer(_mot, _b):
            deb = max([_b.rfind(c, 0, m.start()) for c in '.?!']
                      + [_b.rfind('<br/>', 0, m.start()) + 4]) + 1
            fin = min([i for i in (_b.find(c, m.end()) for c in '.?!') if i != -1] or [len(_b)])
            interro = _b[deb:fin + 1].rstrip().endswith('?')
            citee = _mentionnee(_b, m.start())
            niee = re.search(r"\bne\b|\bn\b|\bpas\b|\bjamais\b|\bni\b|\bnon\b|\bsi\b"
                             r"|\baucune?\b|\brien\b|\bsans\b|\btant que\b", _b[deb:m.start()])
            g(interro or citee or niee is not None, _msg)

# [!!] LES NOMS DE CHAMPS VIVENT DANS LE BLOC DE CODE, PAS DANS LA PROSE — donc on les
#      cherche dans le rendu COMPLET. Ma premiere version ne regardait que le texte et
#      rougissait sur un document parfaitement juste : *une garde qui ne regarde pas la ou
#      la chose est ecrite mesure autre chose qu'elle ne croit.*
for _mot, _pourquoi in (
        ('network access', 'c est le nom exact du champ a changer'),
        ('allowed domains', 'c est le nom exact du second champ'),
        ('also include default list', 'la case oubliee casserait la session')):
    g(_mot in _rendu, 'le document ne parle plus de « %s » : %s' % (_mot, _pourquoi))

for _mot, _pourquoi in (
        ('sans ecrire une seule ligne', 'c est ce qui rend l essai du point D sur'),
        ('son releve, pas ma mesure', 'les secrets Cloudflare ne sont pas mesurables d ici'),
        ('liste d autorisation reseau', 'c est la cause reelle du blocage'),
        ('regle d or #11', 'un bouton serait une fonctionnalite')):
    g(_mot in _bt, 'le document ne parle plus de « %s » : %s' % (_mot, _pourquoi))

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-B - chemin de test reel', author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, hote %s, SHA %s, essai sans ecriture)'
      % (OUT, VERSION, GARDES[0], HOTE, SHA))
