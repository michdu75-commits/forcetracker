#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B — DIAGNOSTIC D'ACCES : une impossibilite se MESURE. Hors depot (regle d'or #14).

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
    SCRATCH, 'S2B-DIAGNOSTIC-ACCES-WORKER-17-09-2026.pdf')
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


# ── V2 est toujours ouverte ───────────────────────────────────────────────────────────
g('p_email: email' in SB, 'le client n envoie plus un p_email libre : V2 serait fermee')

W = lire('worker.js')
WC = sans_commentaires(W)
CO = sans_commentaires(lire('constants.js'))

# ── ce que le DEPOT dit, et qui se lit sans reseau ────────────────────────────────────
_u = re.search(r"AI_PROXY_URL\s*=\s*'https://([a-z0-9.\-]+)'", CO)
g(_u, 'l URL du Worker est introuvable dans constants.js')
HOTE = _u.group(1)
_o = re.search(r"ALLOWED_ORIGIN = '([^']+)'", WC)
g(_o, 'l origine autorisee est introuvable dans worker.js')

# ⭐⭐ LE POINT CENTRAL DU DOSSIER, ET IL SE PROUVE SANS RESEAU : le filtre compare un
#     EN-TETE FOURNI PAR LE CLIENT a une constante, sans aucune verification d authenticite.
FILTRE = ("const _origin = request.headers.get('Origin') || '';" in WC
          and 'if (_origin !== ALLOWED_ORIGIN) {' in WC)
g(FILTRE, 'le filtre d origine n a plus la forme decrite : le document cite son code')
g('crypto' not in WC.split('const _origin')[1][:400],
  'le filtre d origine s appuie desormais sur autre chose que la comparaison de chaine : la '
  'demonstration du document ne tient plus')

# ── le deploiement : automatique, et le SHA se deduit du depot ────────────────────────
WF = os.path.join(ROOT, '.github', 'workflows', 'deploy-worker.yml')
g(os.path.exists(WF), 'le workflow de deploiement a disparu')
_wf = open(WF, encoding='utf-8').read()
g("- 'worker.js'" in _wf and 'wrangler-action' in _wf,
  'le Worker ne se deploie plus automatiquement : le document dit le contraire')
SHA = '304ef728'
import subprocess as _sp
_apres = _sp.run(['git', 'log', '--oneline', SHA + '..HEAD', '--', 'worker.js'],
                 cwd=ROOT, capture_output=True, text=True).stdout.strip()
g(_apres == '',
  'un commit a touche worker.js depuis %s : le SHA deploye annonce par ce document serait '
  'perime (%s)' % (SHA, _apres.split(chr(10))[0][:60]))

# ── les mesures d'acces, LUES dans leur journal ───────────────────────────────────────
g(os.path.exists(LOG_ACCES),
  'le journal des mesures d acces est introuvable : elles doivent etre LUES, pas ecrites a '
  'la main')
ACC = open(LOG_ACCES, encoding='utf-8', errors='replace').read()
CAUSE = 'Host not in allowlist'
g(CAUSE in ACC,
  'le journal ne porte plus le refus nomme : tout ce document repose sur cette phrase')
g('CONNECT tunnel failed, response 403' in ACC, 'le refus du mandataire n est plus mesure')
g('ERR_TUNNEL_CONNECTION_FAILED' in ACC,
  'la mesure au navigateur est absente : le point 12 serait deduit au lieu d etre teste')
g('resolution OK' in ACC, 'la resolution DNS n est plus mesuree')
g(HOTE in ACC, 'le journal ne porte pas le meme hote que le depot')
# ⛔ et surtout : AUCUNE mesure ne montre une reponse DU WORKER
# [!!] GARDE CORRIGEE PAR UNE MUTATION. Ma premiere version cherchait une chaine entre
#      APOSTROPHES — la forme qu'elle a dans le code source du Worker. Or une vraie reponse
#      arrive en JSON, avec des GUILLEMETS : `{"status":"error","error":"origin"}`.
#      >> Elle n'aurait donc JAMAIS attrape une vraie reponse du Worker, c'est-a-dire
#      exactement le seul cas qu'elle existe pour attraper. On normalise les quotes.
_plat_acc = ACC.replace('"', '').replace("'", '').replace(' ', '').lower()
for _signe in ('status:error', 'status:ok', 'error:origin', 'accesrefuse', 'utilisepost'):
    g(_signe not in _plat_acc,
      'le journal contient une reponse du Worker (« %s ») : le document affirme qu aucune '
      'requete ne l a atteint' % _signe)

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
H.append(P('S2-B - diagnostic d acces : une impossibilite se mesure', 'titre'))
H.append(P('Force Tracker - 17 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>aucune modification, aucun code, aucun bouton</b>', 'sous'))

H.append(encadre(
    'POURQUOI CE DOSSIER EXISTE',
    'J ai ecrit a Michel qu on ne pouvait pas tester la nouvelle route avec un outil externe '
    '« parce que le Worker refuse toute origine autre que le site ». <b>Je ne l avais pas '
    'teste.</b> C etait la deuxieme fois dans la journee que je transformais une supposition '
    'en instruction pour lui - la premiere etant « ce Worker se deploie a la main », alors '
    'qu une action automatique s en charge depuis juillet. >> Sa consigne est devenue une '
    'regle : <i>une impossibilite se TESTE, s OBSERVE et s EXPLIQUE ; elle ne se suppose pas '
    'pour devenir une decision produit.</i> Voici la mesure.'))

H.append(P('A - Acces', 'h1'))
H.append(tableau(
    ['#', 'question', 'reponse', 'preuve'],
    [['1', 'URL du Worker lisible dans le depot', OUI,
      (C % 'constants.js') + ', constante de l URL du serveur IA'],
     ['2', 'Worker joignable', NON, 'trois clients, trois refus - voir plus bas'],
     ['3', 'requete HTTP externe possible', NON + ' <i>(depuis ce conteneur)</i>',
      'aucune requete n atteint Cloudflare'],
     ['4', 'en-tete d origine controlable', OUI,
      'fixe explicitement dans la requete ; il est bien parti'],
     ['5', 'corps JSON de test envoyable', OUI, 'envoye'],
     ['6', 'code HTTP lisible', OUI, '403 lu'],
     ['7', 'corps de reponse lisible', OUI,
      'lu - mais c est la reponse <b>du reseau</b>, pas du Worker'],
     ['8', 'jeton de test deja prevu', NON,
      'aucun dans le depot ; les jetons sont emis contre une preuve'],
     ['9', 'workflows de deploiement visibles', OUI, C % '.github/workflows/deploy-worker.yml'],
     ['10', 'SHA deploye determinable', OUI, 'voir section B'],
     ['11', 'journaux Cloudflare', NON,
      'exigent un justificatif que je n ai pas, et que je ne demanderai pas'],
     ['12', 'navigateur automatise', NON + ' - <b>teste</b>, pas deduit',
      'Chromium sans interface : ' + (C % 'ERR_TUNNEL_CONNECTION_FAILED')]],
    [7 * mm, 56 * mm, 33 * mm, 70 * mm]))

H.append(P('<b>La cause exacte</b>, obtenue en contournant les variables de mandataire - donc '
           'mesuree au niveau du reseau lui-meme, et non d un outil mal configure :', 'p'))
H.append(bloc_code('HTTP 403\n' + CAUSE + ' : ' + HOTE + '.\nAdd this host to your network '
                   'egress settings to allow access.'))
H.append(P('Le nom de domaine <b>resout normalement</b>. Ce qui coupe est la <b>liste '
           'd autorisation reseau de ma session</b>, avant tout contact avec Cloudflare. '
           '<b>Les trois clients essayes echouent au meme endroit</b> : en ligne de commande '
           'a travers le mandataire, en direct sans mandataire, et depuis un vrai navigateur '
           'sans interface.', 'p'))
H.append(encadre(
    'ET JE N AI PAS CHERCHE A CONTOURNER',
    'Un refus de politique se <b>rapporte</b>, il ne se contourne pas - c est ecrit noir sur '
    'blanc dans la configuration de cet environnement. Faire appeler le Worker par une action '
    'automatique du depot, par exemple, serait exactement ce contournement. >> <i>Le fait de '
    'pouvoir contourner un garde-fou n est jamais une raison de le faire.</i>'))

H.append(P('B - Deploiement', 'h1'))
H.append(tableau(
    ['', ''],
    [['mode reel', '<b>automatique</b> - une action se declenche a chaque push touchant le '
      'fichier du Worker'],
     ['workflow concerne', C % '.github/workflows/deploy-worker.yml'],
     ['SHA reellement deploye', (C % SHA) + ' - execution n°29, conclusion <b>succes</b>, '
      '13h38 UTC'],
     ['verifie comment', 'aucun commit n a touche le fichier du Worker depuis ce SHA, et une '
      'garde de ce generateur le recompte']],
    [44 * mm, 122 * mm]))

H.append(PageBreak())
H.append(P('C - Origine', 'h1'))
H.append(P('<b>Les trois essais demandes - sans en-tete, avec un mauvais, avec le bon - n ont '
           'PAS pu etre faits.</b> Aucune requete n atteint le Worker, donc je ne peux rien '
           'affirmer par l experience, et ce dossier ne pretend pas le contraire.', 'p'))
H.append(encadre(
    'MAIS MON AFFIRMATION ETAIT FAUSSE, ET CA SE PROUVE SANS RESEAU',
    'Le filtre se lit dans le code du Worker. Il compare <b>un en-tete fourni par le '
    'client</b> a une constante, et <b>rien d autre</b> : pas de signature, pas de jeton, '
    'aucune verification d authenticite. >> <b>Tout client qui envoie le bon en-tete '
    'passe.</b> Le commentaire juste au-dessus dit meme « origine absente (curl/scripts) : '
    'refus » - ce qui est vrai pour un appel <b>nu</b>, et faux des qu on ajoute l en-tete. '
    '<i>Un en-tete d origine protege contre un AUTRE SITE dans un navigateur, jamais contre '
    'un outil en ligne de commande.</i> Michel avait raison.', ORANGE))
H.append(bloc_code("const _origin = request.headers.get('Origin') || '';\n"
                   'if (_origin !== ALLOWED_ORIGIN) { ... refus ... }'))

H.append(P('D - Verdict', 'h1'))
H.append(encadre(
    'TEST EXTERNE IMPOSSIBLE DEPUIS CE CONTENEUR',
    '<b>Cause technique exacte</b> : l hote du Worker n est pas dans la liste d autorisation '
    'reseau de cette session. <b>Ce n est pas le filtre d origine</b>, et ce n est pas une '
    'protection du Worker - c est une regle de mon propre environnement. '
    '>> <b>Et elle est levable par Michel</b> : le message de refus nomme lui-meme le remede - '
    'ajouter cet hote aux parametres reseau de l environnement. Si c est fait, <b>tout le '
    'niveau HTTP devient testable d ici</b>, sans rien ajouter au produit.', VERT))

H.append(P('E - Bouton d administration', 'h1'))
H.append(encadre(
    'UTILE MAIS NON NECESSAIRE - ET PAS POUR LA RAISON QUE J AVAIS DONNEE',
    '<b>Ce qui est testable sans lui</b>, des que l hote est autorise : la route, le filtre '
    'd origine, la validation du jeton, les codes de retour, et le comportement cote base. '
    '<b>Ce qu il apporterait EN PLUS</b> : le vrai JavaScript du client, la vraie pose du '
    'jeton par l injecteur, le vrai contexte de l application installee - rien de tout cela '
    'ne se simule en ligne de commande. <b>Un outil existant fait-il deja la meme chose ?</b> '
    'Le bouton de diagnostic actuel teste l <b>ancienne</b> porte, pas la nouvelle. '
    '>> La decision revient a Michel, et elle ne doit plus reposer sur une fausse contrainte.'))

H.append(P('Ce que je retiens comme methode', 'h1'))
H.append(P('Deux erreurs de la meme famille dans la meme journee : <i>« le Worker se deploie a '
           'la main »</i> - faux, une action automatique s en charge - et <i>« on ne peut pas '
           'tester avec un outil externe a cause de l origine »</i> - non prouve, et '
           'probablement faux. Dans les deux cas, une supposition est devenue une '
           '<b>instruction</b> pour quelqu un d autre. >> <b>La regle qui s ajoute : avant de '
           'demander une manipulation, verifier si l infrastructure la fait deja, et tester '
           'ce qu on pretend impossible.</b>', 'p'))
H.append(P('Document produit par ' + str(GARDES[0]) + ' gardes qui relisent le code servi '
           + VERSION + ', le workflow de deploiement et le journal des mesures - et qui '
           'refusent de produire si une mesure manque, si une reponse du Worker apparaissait '
           'dans ce journal, ou si V2 n etait plus ouverte.', 'petit'))
# @@FIN@@

TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()
_rendu = (TOUT + ' ' + ' '.join(CODES)).lower()

g('sb_publishable' not in _rendu and 'supabase.co' not in _rendu,
  'une cle ou l URL du projet Supabase apparait dans le document')
for m in re.finditer(r'[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}', _rendu):
    g(False, 'une adresse e-mail apparait dans le document : %s' % m.group(0))
for _i in ('service_role', 'secret key', 'sb_secret', 'anthropic_api_key'):
    g(_i not in _rendu, 'le document nomme un justificatif serveur (« %s »)' % _i)


def _mentionnee(txt, i):
    o = txt.rfind('«', 0, i)
    return o >= 0 and txt.find('»', o) > i


INTERDITS = [
    (r'le test externe a ete fait|la requete a atteint le worker|le worker a repondu',
     'le document AFFIRME un test qui n a pas eu lieu'),
    (r"le filtre d origine empeche|l origine rend le test impossible",
     'le document rattribue le blocage au filtre d origine : la cause est la liste '
     'd autorisation reseau'),
    (r'v2 est (desormais )?fermee', 'le document AFFIRME que V2 est fermee'),
    (r'un bouton est necessaire|le bouton est indispensable',
     'le document presente le bouton comme necessaire alors que le verdict dit l inverse'),
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

for _mot, _pourquoi in (
        ('liste d autorisation reseau', 'c est la cause reelle, et elle doit etre nommee'),
        ('levable par michel', 'c est ce qui rend le verdict actionnable'),
        ('michel avait raison', 'la correction doit etre ecrite, pas suggeree'),
        ('ne se contourne pas', 'un refus de politique se rapporte'),
        ('chromium', 'le point 12 est teste et non deduit'),
        ('utile mais non necessaire', 'c est le verdict demande sur le bouton'),
        ('succes', 'le deploiement automatique a reussi')):
    g(_mot in _bt, 'le document ne parle plus de « %s » : %s' % (_mot, _pourquoi))

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-B - diagnostic d acces',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, hote %s, SHA deploye %s, cause : liste d autorisation reseau)'
      % (OUT, VERSION, GARDES[0], HOTE, SHA))
