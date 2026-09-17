#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B — ARCHITECTURE de fermeture de V2. Document d'architecture, AVANT tout code.
Hors depot (regle d'or #14).

[!!] CE GENERATEUR REFUSE DE PRODUIRE UN DOCUMENT QUI ANNONCE UNE FERMETURE. V2 est
     OUVERTE au moment ou il tourne, et il le RE-MESURE dans `supabase.js` a chaque
     execution : si `p_email` disparaissait du client, le document deviendrait faux et
     la garde rougirait. >> Un dossier d'architecture qui decrit un etat qu'il n'a pas
     verifie est un dossier d'architecture qui se perime en silence.

[!!] TOUT CE QUI CONCERNE LE DASHBOARD SUPABASE ET LE PLAN CLOUDFLARE EST MARQUE
     « A VERIFIER ». Le conteneur ne joint ni l'un ni l'autre (proxy : CONNECT tunnel
     failed). Michel a ecrit « Ne l'invente pas. Verifie ce qui est reellement
     disponible. » >> Ce qu'on ne peut pas mesurer d'ici se DIT, il ne se devine pas.

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
    SCRATCH, 'S2B-ARCHITECTURE-FERMETURE-V2-17-09-2026.pdf')

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


def corps_fonction(src, entete):
    """Le corps d'UNE fonction, accolades equilibrees, chaines ignorees.
    [!!] Sans ca, une garde portant sur `_cloudSync` mesurerait tout `setup.js` et
         rougirait sur un usage parfaitement legitime ailleurs dans le fichier."""
    d = src.find(entete)
    if d < 0:
        return ''
    o = src.find('{', d)
    i, prof, n = o, 0, len(src)
    while i < n:
        c = src[i]
        if c in '\'"`':
            q, i = c, i + 1
            while i < n and src[i] != q:
                i += 2 if src[i] == '\\' else 1
        elif c == '{':
            prof += 1
        elif c == '}':
            prof -= 1
            if prof == 0:
                return src[o:i + 1]
        i += 1
    return src[o:]


SB_BRUT = lire('supabase.js')
SB = sans_commentaires(SB_BRUT)
WK = lire('worker.js')
WKC = sans_commentaires(WK)
CJ = sans_commentaires(lire('Code.js'))
SU = sans_commentaires(lire('setup.js'))
CO = sans_commentaires(lire('constants.js'))
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]
g(re.match(r'^ft-v\d+$', VERSION or ''), 'la version servie n a pas pu etre lue dans sw.js')

# ═══════════════════════════════════════════════════════════════════════════════════════
# I. LES MESURES — refaites a chaque execution, sur l'arbre reel
# ═══════════════════════════════════════════════════════════════════════════════════════

# ── 1. V2 est OUVERTE : le client choisit l'identite ──────────────────────────────────
V2_OUVERTE = 'p_email: email' in SB
g(V2_OUVERTE,
  'le client n envoie plus un p_email libre : V2 serait deja fermee, et TOUT ce document '
  'decrit le contraire')
g("p_email:'test@forcetracker.test'" in SB.replace(' ', ''),
  'le bouton de test n ecrit plus une adresse arbitraire : la preuve que V2 a deja ete '
  'exercee disparait du document')

# ── 2. le chemin client : combien de portes, et lesquelles ────────────────────────────
REST = re.findall(r"'/rest/v1/([a-z]+)/'", SB) + re.findall(r'"/rest/v1/([a-z]+)/"', SB)
g(REST and set(REST) == {'rpc'},
  'le client atteint autre chose que /rest/v1/rpc/ : « aucun acces direct a la table » '
  'serait faux (mesure : %r)' % (sorted(set(REST)),))
NB_RPC = SB.count('/rest/v1/rpc/')
g(NB_RPC == 2, 'le nombre de portes Supabase cote client n est plus 2 mais %d' % NB_RPC)

# ── 3. S2-A tient toujours : le corps metier ne porte aucun justificatif ──────────────
CS = corps_fonction(SU, 'function _cloudSync(')
g(len(CS) > 2000, 'le corps de _cloudSync n a pas pu etre isole')
_corps = CS[CS.find('const _corpsSync'):CS.find('fetch(S.url')]
for _j in ('authCode', 'token'):
    g(_j not in _corps,
      'le corps metier commun reporte « %s » : le correctif S2-A (ft-v1217) serait perdu, '
      'et le miroir recevrait de nouveau un justificatif' % _j)
g('authCode:_authCode(), token:_ftToken()' in CS.replace('\n', ' ').replace('  ', ' '),
  'les justificatifs ne sont plus ajoutes au seul transport Apps Script')
g('sbMirror(_corpsSync)' in CS, 'le miroir ne recoit plus le corps metier commun')

# ── 4. le filet de la porte Supabase ──────────────────────────────────────────────────
_m = re.search(r'_SB_JUSTIFICATIFS\s*=\s*\[([^\]]+)\]', SB)
g(_m, 'la liste des justificatifs a disparu de la porte Supabase')
NB_FILET = len([x for x in _m.group(1).split(',') if x.strip()])
g(NB_FILET == 6, 'le filet ne retire plus 6 noms de cles mais %d' % NB_FILET)

# ── 5. aucun secret privilegie dans les fichiers servis ───────────────────────────────
SERVIS = ['supabase.js', 'setup.js', 'app.js', 'state.js', 'constants.js', 'coach.js',
          'log.js', 'screens.js', 'tracking.js', 'index.html']
_porteurs = [f for f in SERVIS if 'service_role' in sans_commentaires(lire(f))]
g(not _porteurs,
  'un fichier servi porte « service_role » ailleurs que dans un commentaire (%s)'
  % ', '.join(_porteurs))
SERVICE_ROLE_EN_COMMENTAIRE = 'service_role' in SB_BRUT and 'service_role' not in SB
g(SERVICE_ROLE_EN_COMMENTAIRE,
  'le mot service_role n est plus present uniquement comme AVERTISSEMENT dans supabase.js : '
  'c est pourtant le controle negatif nomme par Michel (« nomme dans un commentaire = vert »)')

# ── 6. le Worker n'est pas encore sur le chemin Supabase ──────────────────────────────
WK_SB = len(re.findall(r'supabase', WK, re.I))
g(WK_SB == 0,
  'le Worker mentionne deja Supabase (%d fois) : ce document propose de l y amener, il ne '
  'peut pas decrire un chemin qui existe' % WK_SB)
g('async function _identiteIA(token, env)' in WKC,
  'le pont d identite du Worker a disparu : la strategie 1 repose entierement dessus')
g("action: 'authIdentity'" in WKC, 'le pont n appelle plus la route authIdentity')
g("raison: 'reseau'" in WKC,
  'le pont ne rend plus un refus sur panne reseau : il ne serait plus fail-closed, et le '
  'document affirme le contraire')
g('const _origin = request.headers.get(' in WKC and "!== ALLOWED_ORIGIN" in WKC,
  'le filtre d origine du Worker a disparu')
RELAIS_ATTRAPE_TOUT = 'body: raw,' in WKC and 'APPS_SCRIPT_URL' in WKC
g(RELAIS_ATTRAPE_TOUT,
  'le relais attrape-tout du Worker a disparu : le piege decrit en section 11 ne serait '
  'plus reel')
_acts = re.search(r'_ACTIONS_IA = new Set\(\[(.*?)\]\)', WKC, re.S)
g(_acts, 'la liste des actions IA du Worker est illisible')
NB_ACTIONS = len(re.findall(r"'[a-zA-Z]+'", _acts.group(1)))
g(NB_ACTIONS == 14, 'le Worker ne porte plus 14 actions IA mais %d' % NB_ACTIONS)

# ── 7. le registre S1 reel — la piece qui decide de la question centrale ──────────────
g("_JET_PREFIXE_ = 'tok_'" in CJ, 'le prefixe du registre S1 a change')
g('_JET_PREFIXE_ + _sha256hex_(brut)' in CJ,
  'la CLE du registre n est plus le hachage SHA-256 du jeton brut : toute la reponse a la '
  'question centrale (transposer sans reconnexion) repose sur ce seul fait')
g('_JET_PREFIXE_ + _sha256hex_(b)' in CJ,
  'la lecture du registre ne passe plus par le meme hachage que l ecriture')
_poser = corps_fonction(CJ, 'function _jetonPoser_(')
for _ch in ('e: e', 'c: new Date()', 'r: 0', 'd: String(libelle'):
    g(_ch in _poser,
      'le registre S1 ne stocke plus « %s » : le schema propose en section 10 ne serait '
      'plus une transposition fidele' % _ch)
_ident = corps_fonction(CJ, 'function _jetonIdentite_(')
g('b.length !== 64' in _ident, 'le controle de longueur du jeton a disparu')
for _r in ("'absent'", "'inconnu'", "'illisible'", "'revoque'"):
    g(_r in _ident, 'le registre ne distingue plus le refus %s' % _r)
_revoq = corps_fonction(CJ, 'function _jetonRevoquer_(')
g('o.r = 1' in _revoq and 'deleteProperty' not in _revoq,
  'la revocation SUPPRIME desormais l entree au lieu de la marquer : la colonne revoque du '
  'schema propose n aurait plus d equivalent, et un jeton revoque redeviendrait inconnu')
g('function _jetonsDuCompte_(' in CJ, 'la brique multi-appareils du registre a disparu')
g('var _MIG_FERME_ = false' in CJ,
  'la transition S1 n est plus ouverte : la sequence en six phases suppose qu elle l est')
g('function _identitePourEcriture_(' in CJ,
  'le point d entree des ecritures sensibles a disparu')
g("return { ok: true, email: j.email, mode: 'jeton' }" in CJ,
  'le serveur ne decide plus l e-mail a partir du jeton')

# ── 8. le client possede deja un jeton, et le Worker le recoit deja ───────────────────
g("FT_TOKEN_KEY='ft4_devtoken'" in CO.replace(' ', ''),
  'la cle locale du jeton a change')
# [!!] BORNE DE MOT, ET CE N EST PAS UN DETAIL DE STYLE. Une simple recherche de sous-chaine
#      resterait VERTE si la fonction etait renommee `_ftPoserInjecteurJetonZ` — l ancien nom
#      est contenu dans le nouveau. C est la famille `presentsX` / `needsCode2` / `im>=90`,
#      quatre fois dans ce projet. >> Trouve ici par une mutation, pas par relecture.
g(re.search(r'_ftPoserInjecteurJeton\b', CO),
  'l injecteur de jeton a disparu : le fait que le Worker recoive DEJA le jeton brut est '
  'l argument qui ecarte le pre-hachage cote navigateur')
g('url.indexOf(AI_PROXY_URL)===0' in CO.replace(' ', ''),
  'l injecteur n est plus borne a l URL du Worker')

# ── 9. la dette SQL : rien de versionne aujourd'hui ───────────────────────────────────
# ⭐ GARDE RETOURNEE LE 17/09/2026 (R30), PAS EFFACEE. Elle disait « aucun fichier SQL dans
#    le depot ». S2-B ouvre `supabase/migrations/` : le SQL versionne y est desormais LEGITIME.
#    L'invariant reel s'est precise — *aucun SQL EGARE hors du dossier versionne*. ⚠️ Et la dette
#    que ces dossiers decrivent reste VRAIE : `ft_comptes` et `ft_miroir`, creees a la main, ne
#    sont toujours pas versionnees (voir supabase/README.md).
SQLS = [f for _dd, _s, _f in os.walk(ROOT) for f in _f
        if f.endswith('.sql') and 'node_modules' not in _dd
        and 'supabase' + os.sep not in _dd]
g(not SQLS,
  'des fichiers SQL egares existent hors de supabase/migrations (%s)' % ', '.join(SQLS[:3]))
# ⭐ CE DOCUMENT EST DATE, ET SON ETAT A CHANGE LE JOUR MEME. Il decrivait « rien n est
#    versionne » ; S2-B a depuis ouvert `supabase/migrations/`. On ne fige pas le texte : on
#    MESURE, et la phrase s'adapte. ⛔ La dette de fond, elle, reste entiere : `ft_comptes` et
#    `ft_miroir` ont ete creees a la main et ne sont toujours pas versionnees — les recrire
#    de memoire fabriquerait une source de verite SUPPOSEE.
VERSIONNE = os.path.isdir(os.path.join(ROOT, 'supabase', 'migrations'))
MIGS = sorted(f for f in os.listdir(os.path.join(ROOT, 'supabase', 'migrations'))
              if f.endswith('.sql')) if VERSIONNE else []
_anciennes_versionnees = any(
    'ft_comptes' in open(os.path.join(ROOT, 'supabase', 'migrations', f),
                         encoding='utf-8').read().split('RETOUR ARRIERE')[0]
    and 'create table' in open(os.path.join(ROOT, 'supabase', 'migrations', f),
                               encoding='utf-8').read().lower().split('ft_comptes')[0][-120:]
    for f in MIGS)
g(not _anciennes_versionnees,
  'une migration pretend (re)creer ft_comptes : ce serait presenter une reconstitution comme '
  'la definition reelle, alors que la vraie a ete creee a la main et seulement MESUREE')

# ── 10. ce que la mesure du 17/09 a etabli, et qu'on ne remesure pas ici ──────────────
DROITS_ANON = [('SELECT', 'OUI'), ('INSERT', 'NON'), ('UPDATE', 'NON'), ('DELETE', 'OUI'),
               ('TRUNCATE', 'OUI'), ('EXECUTE ft_miroir', 'OUI'), ('BYPASSRLS', 'NON')]
g(dict(DROITS_ANON)['SELECT'] == 'OUI' and dict(DROITS_ANON)['BYPASSRLS'] == 'NON',
  'les droits mesures a l etape D ne sont plus ceux du releve')
LECTURE_REELLE = 'HTTP 200 | []'
g('200' in LECTURE_REELLE and '[]' in LECTURE_REELLE,
  'la mesure de lecture publique n est plus celle de l etape E')

# ═══════════════════════════════════════════════════════════════════════════════════════
# II. LE DOCUMENT
# ═══════════════════════════════════════════════════════════════════════════════════════
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


OUI, NON, PART, AVER = ('<b>OUI</b>', '<b>NON</b>', '<b>PARTIEL</b>',
                        '<b>A VERIFIER</b>')

H = []
# @@DEBUT@@
H.append(P('S2-B - architecture de fermeture de V2', 'titre'))
H.append(P('Force Tracker - 17 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>document d architecture, AUCUN code ecrit</b> - aucun '
           'fichier servi modifie', 'sous'))

H.append(encadre(
    'CE QUE CE DOCUMENT EST, ET CE QU IL N EST PAS',
    'Il compare des options AVANT d ecrire une ligne, parce que Michel l a demande ainsi : '
    '<i>« NE CODE PAS AVANT D AVOIR COMPARE LES OPTIONS DE PRIVILEGES »</i>. Il ne ferme '
    'rien. A l instant ou il est produit, le navigateur choisit toujours le compte Supabase '
    'en envoyant une adresse, et le generateur le RE-MESURE dans le fichier servi a chaque '
    'execution : si cette propriete disparaissait du code, ce document refuserait de sortir. '
    'Tout ce qui concerne le tableau de bord Supabase et le plan Cloudflare est marque '
    '<b>A VERIFIER</b> - le conteneur ne joint ni l un ni l autre, et une architecture batie '
    'sur un etat suppose est une architecture qu on devra refaire.'))

# ── 1 ────────────────────────────────────────────────────────────────────────────────
H.append(P('1. Inventaire exact du chemin client actuel', 'h1'))
H.append(P('Mesure sur l arbre servi, pas de memoire. Le client a <b>deux</b> portes vers '
           'Supabase, et les deux sont la meme : un appel de fonction. Il n a '
           '<b>aucun</b> chemin de lecture ni d ecriture directe sur la table.', 'p'))
H.append(tableau(
    ['porte', 'fichier', 'ce qu elle envoie', 'identite'],
    [[C % 'sbMirror(payload)', C % 'supabase.js',
      'appel de fonction, ' + (C % 'p_email') + ' = l adresse du profil local, '
      + (C % 'p_data') + ' = le corps metier filtre',
      '<b>choisie par le navigateur</b>'],
     [C % 'sbTest()', C % 'supabase.js',
      'meme fonction, mais ' + (C % 'p_email') + ' est une adresse de test ecrite en dur '
      'dans le fichier',
      '<b>arbitraire</b> - et c est la preuve'],
     ['lecture de la table', '-', 'aucune', '-'],
     ['ecriture directe', '-', 'aucune (retiree le 05/08/2026)', '-']],
    [34 * mm, 24 * mm, 74 * mm, 34 * mm]))
H.append(P('Mesure : <b>' + str(NB_RPC) + '</b> appels vers un point de terminaison '
           'd appel de fonction, <b>zero</b> vers la table. Le corps metier est construit '
           'une seule fois dans ' + (C % '_cloudSync') + ' et servi aux deux destinations '
           '(regle R2) ; depuis ft-v1217 il ne porte plus aucun justificatif, et la porte '
           'Supabase en retire <b>' + str(NB_FILET) + '</b> noms de cles par securite. Les '
           'deux proprietes sont re-verifiees par ce generateur.', 'p'))
H.append(encadre(
    'LA PREUVE QUE V2 N EST PAS UNE HYPOTHESE - ELLE A DEJA ETE EXERCEE',
    'Le bouton de diagnostic ' + (C % 'sbTest') + ' ecrit une ligne pour une adresse qui '
    'n est celle de personne, avec la seule cle publique distribuee dans l application. La '
    'ligne existe reellement dans la table : elle a ete comptee le 17/09 (une ligne de test '
    'sur dix). >> <b>Le defaut n est donc pas « la cle POURRAIT ecrire pour un autre » : elle '
    'l a DEJA fait, et le depot en porte le mode d emploi.</b> C est pour cette raison que '
    'Michel a ecrit « Ne refais PAS l etape F. Il n apporterait rien. »'))

# ── 2 ────────────────────────────────────────────────────────────────────────────────
H.append(P('2. Inventaire du Worker actuel', 'h1'))
H.append(P('Le Worker (' + (C % 'worker.js') + ') porte <b>' + str(NB_ACTIONS) + '</b> '
           'actions IA et ne connait <b>pas du tout</b> Supabase : le mot n y apparait '
           '<b>' + str(WK_SB) + '</b> fois. Il n est donc pas sur le chemin a fermer - il '
           'est le precedent dont on peut copier la forme.', 'p'))
H.append(tableau(
    ['piece', 'ce qu elle fait deja', 'ce que S2-B en ferait'],
    [['filtre d origine',
      'refuse toute requete dont l origine n est pas le site - donc aussi ' + (C % 'curl'),
      'garde tel quel, en controle <b>secondaire</b> : ce n est pas une identite'],
     [C % '_identiteIA(token, env)',
      'envoie le jeton brut a Apps Script, recoit l identite reelle, l etat premium et le '
      'verdict de quota. <b>Bloquant</b> et <b>fail-closed</b> : une panne reseau rend un '
      'refus, jamais un laisser-passer',
      '<b>c est exactement la strategie 1 du brief, deja ecrite et deja en service</b>'],
     [C % '_compterIA(...)',
      'compte les appels IA, en tache de fond, et echoue OUVERT (un comptage rate ne doit '
      'pas priver quelqu un de Milo)',
      'ne doit <b>pas</b> etre reutilise : une sauvegarde n est pas une depense d IA'],
     ['relais attrape-tout',
      'toute action <b>non reconnue</b> est reexpediee telle quelle a Apps Script',
      '<b>piege</b> : une action de sauvegarde mal orthographiee partirait en silence chez '
      'Google avec tout l instantane']],
    [30 * mm, 76 * mm, 60 * mm]))
H.append(P('Le commentaire du Worker dit lui-meme, ecrit avant ce chantier : <i>« Un jeton '
           'signe s eviterait cet aller-retour - c est la porte laissee ouverte pour S2. »</i> '
           'La piece que le brief appelle « pont transitoire » <b>existe donc deja et tourne '
           'en production</b> depuis ft-v1216.', 'p'))
H.append(encadre(
    'ET LE POINT QUI SUPPRIME UNE COMPLICATION ENTIERE',
    'L injecteur pose dans ' + (C % 'constants.js') + ' ajoute deja le jeton <b>brut</b> a '
    'chaque appel du Worker. >> <b>Le Worker recoit donc deja le jeton brut aujourd hui</b> : '
    'faire pre-hacher le jeton par le navigateur pour « eviter qu il transite » n eviterait '
    'rien du tout, casserait le pont (Apps Script attend le brut) et ajouterait une '
    'dependance a une primitive qui peut manquer. <i>Une protection qui ne protege que contre '
    'ce qui se passe deja ailleurs est une complication, pas une securite.</i> Ecarte.',
    ORANGE))

# ── 3 ────────────────────────────────────────────────────────────────────────────────
H.append(PageBreak())
H.append(P('3. Inventaire du registre S1 reel - et la reponse a la question centrale', 'h1'))
H.append(P('Le registre vit dans les proprietes de script d Apps Script. Sa forme, relue '
           'ligne a ligne :', 'p'))
H.append(bloc_code(
    "cle    : 'tok_' + sha256hex(jeton_brut)\n"
    "valeur : { e: adresse, c: 'AAAA-MM-JJ', r: 0|1, d: libelle appareil (24 car.),\n"
    "           x: 'AAAA-MM-JJ' (date de revocation, posee seulement si r = 1) }"))
H.append(tableau(
    ['propriete mesuree', 'dans le code', 'consequence pour S2-B'],
    [['la cle EST le hachage du jeton',
      C % '_JET_PREFIXE_ + _sha256hex_(brut)',
      '<b>le registre est deja sous sa forme transposable</b> : on copie une cle, on ne '
      'refabrique rien'],
     ['le brut n est jamais persiste',
      'rendu une seule fois a l emission, puis oublie',
      'on ne <b>peut</b> pas le stocker ailleurs, meme en le voulant'],
     ['refus par defaut',
      'longueur exigee, puis absent / inconnu / illisible / revoque',
      'la fonction proposee copie la meme forme'],
     ['revocation = marquage',
      C % 'o.r = 1' + ' (jamais une suppression)',
      'une colonne booleenne suffit ; un jeton revoque reste distinguable d un inconnu'],
     ['N jetons par compte',
      C % '_jetonsDuCompte_(email)',
      'le lien est « plusieurs jetons -> un compte » : c est une table, pas une colonne'],
     ['transition encore ouverte',
      C % '_MIG_FERME_ = false',
      'des appareils sans jeton existent encore : la bascule doit etre progressive']],
    [38 * mm, 54 * mm, 74 * mm]))

H.append(encadre(
    'QUESTION CENTRALE - « peut-on transposer le registre sans reconnexion generale, sans '
    'perdre les jetons, sans stocker les bruts, sans casser la revocation selective ? »',
    'Les quatre reponses, tirees de la mesure ci-dessus et non d une intention. '
    '<b>(1) Reconnexion generale : NON, elle n est pas necessaire.</b> Ce que Supabase doit '
    'connaitre est le hachage - or Apps Script le stocke deja, en clair, comme cle. On le '
    'recopie ; les appareils gardent le jeton qu ils ont. <b>(2) Perte de jetons : NON.</b> '
    'Une recopie n est pas une reemission. <b>(3) Jeton brut stocke : NON</b>, et mieux que '
    'cela : le serveur ne le detient nulle part, donc la contrainte est deja tenue par '
    'construction, pas par discipline. <b>(4) Revocation selective : preservee</b>, le '
    'drapeau devient une colonne. >> <b>La transposition est donc possible, et c est le '
    'registre lui-meme qui l avait prevu</b> : son commentaire, ecrit avant ce chantier, dit '
    'deja <i>« la forme choisie ici - une ligne plate hachage -> compte, date, etat - se '
    'transpose telle quelle en table Supabase »</i>.', VERT))
H.append(encadre(
    'LA SEULE CONTRAINTE DURE, ET ELLE N EST PAS DANS LA COPIE : C EST LA SUITE',
    'Copier le registre une fois est facile. Le tenir a jour ne l est pas. Deux moments le '
    'font diverger, et <b>ils ne se valent pas du tout</b>. Une <b>emission</b> manquee est '
    'benigne : le hachage est simplement absent, le pont resout, et l inscription se fait au '
    'passage (section 5) - <i>l ecart se repare tout seul a la premiere utilisation</i>. Une '
    '<b>revocation</b> manquee, elle, laisse un appareil retire continuer d ecrire : <i>c est '
    'exactement la propriete qu on pretend fermer, deplacee d un cran</i>. >> Regle a tenir : '
    'la revocation ecrit dans Supabase de facon <b>bloquante</b> - c est une operation rare, '
    'elle peut se permettre d attendre - et une reconciliation periodique sert de filet. '
    '<b>C est le seul point du chantier qui doit echouer FERME</b>, et c est le vrai cout de '
    'la strategie 2.'))

# ── 4 ────────────────────────────────────────────────────────────────────────────────
H.append(P('4. Comparaison des options de privileges', 'h1'))
OPT = [['<b>A</b> - secret large dans le Worker',
      'un secret qui contourne toutes les regles de ligne',
      '<b>toute la base</b> : lecture, ecriture, suppression de toutes les tables',
      OUI + ' (c est le secret standard d un projet)'],
     ['<b>B</b> - secret serveur moins privilegie',
      'un justificatif rattache a un role cree sur mesure, sans droit sur les tables sauf '
      'celui d appeler une fonction',
      '<b>une fonction</b> : ecrire l instantane d un compte dont on presente un jeton valide',
      AVER + ' - depend de ce que le projet offre reellement, voir section 18'],
     ['<b>C</b> - fonction bornee seule',
      'rien du tout',
      'sans objet : il n y a pas de secret',
      NON + ' seul - une fonction dont tout le monde a l execution reproduit V2'],
     ['<b>D</b> - secret serveur <b>+</b> fonction bornee',
      'le secret disponible, mais le code n appelle <b>qu une</b> fonction',
      'celui du secret detenu - <b>et rien de plus par le code du Worker</b>',
      OUI + ' immediatement, avec B en amelioration']]
# [!!] LA MARQUE « A VERIFIER » SE CONTROLE SUR SA PROPRE LIGNE, jamais « quelque part dans
#      le document » : elle apparait aussi en section 15 et dans le tableau des risques, donc
#      une garde globale resterait verte alors que l option B aurait perdu sa reserve.
#      >> Trouve par une mutation. Meme faute que le dossier de l etape A, meme correctif.
_ob = [r for r in OPT if r[0].startswith('<b>B</b>')]
g(len(_ob) == 1 and AVER in _ob[0][3],
  'l option B n est plus marquee « A VERIFIER » dans le tableau des options : le document '
  'affirmerait alors une disponibilite que le conteneur ne peut pas mesurer')
_oa = [r for r in OPT if r[0].startswith('<b>D</b>')]
g(len(_oa) == 1 and OUI in _oa[0][3],
  'l option D n est plus donnee comme praticable immediatement, alors que c est la '
  'recommandation de cette section')
H.append(tableau(
    ['option', 'ce que le Worker detient', 'rayon d explosion si le secret fuit',
     'disponible ici ?'],
    OPT,
    [34 * mm, 40 * mm, 50 * mm, 42 * mm]))
H.append(encadre(
    'LA DISTINCTION QU IL NE FAUT PAS ECRASER, ET C EST CELLE QUI CHANGE LE VERDICT',
    'Une fonction bornee <b>ne reduit pas</b> le rayon d explosion d un secret vole : qui '
    'detient le secret parle a la base directement, sans passer par le code du Worker. Ce '
    'qu elle reduit, c est le rayon d une <b>erreur de programme</b> - une variable prise '
    'pour une autre, une requete construite par concatenation, une route oubliee. Les deux '
    'risques sont reels et ne se remplacent pas. >> Dire « avec une fonction bornee, le '
    'secret large devient sans danger » serait faux, et c est exactement le genre de phrase '
    'qui clot une question pour des mois (c est la lecon de l ancien jeton d administration, '
    'hache cote serveur mais distribue en clair dans l application).'))
H.append(P('<b>Recommandation : option D</b>, et elle se lit comme un ordre de montage plutot '
           'que comme un compromis. Le Worker n appelle <b>qu une</b> fonction nommee - jamais '
           'un acces generique a la table - donc le jour ou l option B s avere disponible, '
           '<b>on remplace le secret et rien d autre ne bouge</b>. L inverse (commencer large '
           'et resserrer plus tard) demande de relire tout le code du Worker. <i>Le choix le '
           'moins privilegie reellement praticable est celui qui laisse la place au suivant.</i>',
           'p'))

# ── 5 ────────────────────────────────────────────────────────────────────────────────
H.append(P('5. Pont Apps Script contre registre Supabase', 'h1'))
H.append(tableau(
    ['', 'strategie 1 - pont', 'strategie 2 - registre transpose'],
    [['ce qu il faut ecrire',
      '<b>presque rien</b> : le pont existe, tourne en production et est fail-closed',
      'une table, une synchronisation d emission et de revocation, une reconciliation'],
     ['ferme V2 ?', OUI + ', integralement', OUI + ', integralement'],
     ['une panne Google empeche-t-elle la sauvegarde Supabase ?',
      '<b>' + OUI + '</b> - l identite ne peut plus etre resolue',
      NON + ' - Supabase resout seul'],
     ['latence ajoutee', 'un aller-retour vers Apps Script par sauvegarde', 'une recherche indexee'],
     ['conforme a « Supabase = cloud actif principal » ?', NON, OUI]],
    [40 * mm, 62 * mm, 64 * mm]))
H.append(encadre(
    'LE CRITERE QUI TRANCHE N EST PAS LA LATENCE, C EST UNE PANNE DEJA VECUE',
    'Le miroir Supabase existe <b>parce qu Apps Script est tombe</b>. Deux fois, et le depot '
    'les a ecrites : le reservoir plein a 102 % le 29/07/2026 (plus aucune ecriture pendant '
    'deux jours, <i>sans que personne ne le voie</i>), et le backend entier refusant de se '
    'charger apres qu un fichier du site ait ete pousse dedans par erreur. >> <b>Une '
    'conception ou une ecriture Supabase exige qu Apps Script reponde rend le filet '
    'indisponible exactement au moment ou il sert.</b> L en-tete de ' + (C % 'supabase.js') +
    ' pose deja la regle dans un sens - <i>« si Supabase tombe, il ne se passe strictement '
    'rien »</i> - et la symetrie inverse ne doit pas s installer par commodite.'))
H.append(encadre(
    'DECISION - ET LES DEUX STRATEGIES CESSENT D ETRE DES ALTERNATIVES',
    'Le brief les presente comme un choix. <b>La bonne lecture est que la premiere est le '
    'MECANISME DE MIGRATION de la seconde.</b> Le Worker resout un jeton par le pont ; s il '
    'ne trouve pas le hachage correspondant dans Supabase, <b>il l y inscrit</b> - la '
    'reponse du pont fait autorite, c est donc une source sure. >> Consequence : <b>aucune '
    'recopie de masse, aucun script de reprise, aucune fenetre ou les deux registres se '
    'repondent differemment</b>. Le registre se remplit a l usage, appareil par appareil, et '
    'chaque appareil deja inscrit est resolu par Supabase <b>seule</b> des la fois suivante. '
    '<i>La dependance a Google ne se retire pas d un coup a une date : elle decroit toute '
    'seule.</i> C est pour cette raison que la reponse a Q12 est <b>PARTIEL</b> - decroissant, '
    'et mesurable par le nombre de lignes du registre.', VERT))
H.append(P('Michel avait prevu cette lecture en formulant Q12 : <i>« NON a terme, ou PARTIEL '
           'si un pont transitoire explicitement documente subsiste »</i>. Le pont subsiste, '
           'il est documente ici, et <b>il ne sert plus a chaque sauvegarde mais a chaque '
           'appareil NOUVEAU</b>. Il ne disparaitra que le jour ou l emission d un jeton '
           'ecrira elle-meme dans les deux registres - <i>ce qui est un geste, pas un '
           'chantier</i>.', 'p'))
H.append(encadre(
    'CE QUE CETTE LECTURE CORRIGE DANS MON PROPRE PLAN, ET IL FAUT LE DIRE',
    'La premiere version de ce document faisait de la phase 2 un essai <b>par le pont</b> et '
    'de la phase 3 une <b>recopie</b> du registre. Les deux ne tenaient pas ensemble : si la '
    'fonction cherche un hachage dans une table encore vide, l essai de la phase 2 ne peut '
    'pas aboutir, et le pont n y sert a rien. >> <b>C etait une incoherence d ordre, pas de '
    'principe</b> - et elle se serait vue au premier essai reel, c est-a-dire au pire moment. '
    'Le remplissage a l usage la supprime : il n y a plus de phase de recopie du tout.',
    ORANGE))

# ── 6 ────────────────────────────────────────────────────────────────────────────────
H.append(PageBreak())
H.append(P('6. Decision d architecture', 'h1'))
H.append(bloc_code(
    "navigateur  --(jeton S1 brut + instantane metier)-->  Worker\n"
    "                                                        |\n"
    "                              sha256(jeton) connu de Supabase ?\n"
    "                                   /                        \\\n"
    "                                 oui                        non\n"
    "                                  |                          |\n"
    "                                  |            pont -> Apps Script (identite reelle)\n"
    "                                  |                          |\n"
    "                                  |            inscription du hachage au registre\n"
    "                                   \\                        /\n"
    "                                    fonction bornee, secret serveur\n"
    "                                                v\n"
    "                                            ft_comptes\n"
    "\n"
    "et, inchange et independant :\n"
    "navigateur  --(instantane + justificatifs)-->  Apps Script  -->  sauvegarde Google"))
H.append(P('Trois proprietes definissent cette architecture, et chacune repond a une phrase '
           'du brief. <b>(a) L adresse disparait de l entree</b> : le navigateur ne la '
           'presente plus, donc il ne peut plus la choisir - ce n est pas un controle qu on '
           'ajoute, c est un parametre qu on retire. <b>(b) Le Worker n appelle qu une '
           'fonction nommee</b>, jamais un acces generique. <b>(c) Les deux chemins restent '
           'separes</b> : une panne de l un n empeche pas l autre, et aucun des deux ne '
           'bloque le local.', 'p'))

# ── 7 ────────────────────────────────────────────────────────────────────────────────
H.append(P('7. Modele d identite - et pourquoi le chantier ne grossit pas', 'h1'))
H.append(P('L identite presentee est le <b>jeton</b>. L adresse redevient ce qu elle aurait '
           'toujours du etre : un <b>resultat</b> calcule par le serveur, jamais une entree. '
           'Reste la question que Michel a explicitement ouverte - faut-il remplacer la cle '
           'primaire de la table par un identifiant technique ?', 'p'))
H.append(tableau(
    ['critere', 'garder l adresse comme cle', 'introduire un identifiant technique'],
    [['benefice reel pour S2-B', '<b>le meme</b> : l adresse n est plus fournie par le client',
      '<b>aucun</b> pour ce chantier'],
     ['cout de migration', 'nul',
      'reecrire les dix lignes, la fonction, le registre, et faire coexister deux cles le '
      'temps de la bascule'],
     ['impact historique', 'nul', 'les anciennes copies ne portent pas cet identifiant'],
     ['multi-appareils', 'deja resolu par le registre des jetons', 'identique'],
     ['changement d adresse', '<b>la vraie faiblesse</b> : changer d adresse cree une '
      'nouvelle ligne', 'resolu - mais aucun mecanisme de changement d adresse n existe '
      'aujourd hui dans le produit'],
     ['impact Google', 'nul - Apps Script est indexe sur l adresse',
      '<b>divergence</b> : deux systemes n auraient plus la meme cle']],
    [30 * mm, 60 * mm, 76 * mm]))
H.append(encadre(
    'REPONSE DEMANDEE EXPLICITEMENT : L ADRESSE RESOLUE PAR LE SERVEUR SUFFIT POUR S2-B',
    'Michel a ecrit <i>« Si l e-mail serveur suffit pour S2-B : dis-le. Ne grossis pas le '
    'chantier inutilement. »</i> >> <b>Elle suffit.</b> Le defaut n a jamais ete que la cle '
    'soit une adresse ; il est que <b>le client la fournissait</b>. Une fois l entree '
    'supprimee, une cle technique ne fermerait rien de plus - elle ne reglerait qu un '
    'probleme que le produit n a pas encore (changer d adresse), au prix d une divergence '
    'avec Google qu il a deja. <b>Pas de migration d identifiant dans ce chantier</b> ; a '
    'rouvrir le jour ou le changement d adresse devient une fonctionnalite reelle.', VERT))

# ── 8 / 9 ────────────────────────────────────────────────────────────────────────────
H.append(P('8. Multi-appareils - et 9. revocation', 'h1'))
H.append(P('Le lien est <b>plusieurs jetons pour un compte</b>, deja vrai dans S1 et deja '
           'voulu (« telephone, PC, futur Android, futur iPhone »). La table des comptes, '
           'elle, garde <b>une ligne par compte</b> : deux appareils qui sauvegardent '
           'ecrasent tour a tour la meme ligne. <b>C est exactement le comportement '
           'd aujourd hui</b> - la fonction mesuree le 17/09 remplace le contenu en entier, '
           'sans fusion et sans historique - donc S2-B ne change rien de ce cote, et ce '
           'document ne pretend pas le contraire.', 'p'))
H.append(P('La revocation reste <b>selective</b> : retirer un appareil retire une ligne du '
           'registre, pas le compte. Les deux regles a tenir : le refus doit etre '
           '<b>identique</b> pour un jeton absent, inconnu ou revoque - sinon la reponse '
           'devient un oracle qui apprend a un inconnu quels jetons existent, ce qu Apps '
           'Script peut se permettre pour son diagnostic mais qu une porte publique ne peut '
           'pas - et la revocation doit <b>atteindre</b> Supabase (section 3).', 'p'))

# ── 10 ───────────────────────────────────────────────────────────────────────────────
H.append(P('10. Schema Supabase propose', 'h1'))
H.append(bloc_code(
    "create table public.ft_jetons (\n"
    "  hachage     text primary key,          -- sha256 hexadecimal du jeton brut\n"
    "  compte      text not null,             -- l'adresse canonique, resolue serveur\n"
    "  cree_le     date not null default current_date,\n"
    "  revoque     boolean not null default false,\n"
    "  revoque_le  date,\n"
    "  appareil    text                       -- libelle court, jamais identifiant\n"
    ");\n"
    "create index ft_jetons_compte_idx on public.ft_jetons (compte);\n"
    "\n"
    "-- le navigateur n'a RIEN sur cette table, et on ne compte pas sur l'absence de regle\n"
    "revoke all on public.ft_jetons from anon, authenticated, public;\n"
    "alter table public.ft_jetons enable row level security;\n"
    "alter table public.ft_jetons force  row level security;"))
H.append(encadre(
    'POURQUOI « revoke » EXPLICITE ALORS QUE LA TABLE VIENT D ETRE CREEE',
    'Parce que la mesure du 17/09 a montre le contraire de l intuition : sur la table des '
    'comptes, le role public <b>possede</b> le droit de lecture, de suppression et de '
    'troncature - personne ne les lui a donnes volontairement, ils viennent des droits '
    'accordes par defaut aux nouvelles tables. >> <b>Une table creee sans « revoke » nait '
    'donc ouverte.</b> Et la seconde ligne dit la meme chose autrement : Michel a ecrit '
    '<i>« Je prefere absence de privilege SQL plutot qu une dependance a "aucune policy" »</i> '
    '- ici on a les deux, dans cet ordre.'))

# ── 11 ───────────────────────────────────────────────────────────────────────────────
H.append(PageBreak())
H.append(P('11. Fonction proposee', 'h1'))
H.append(bloc_code(
    "create or replace function public.ft_enregistrer_instantane(\n"
    "         p_hachage text, p_data jsonb)\n"
    "returns void language plpgsql security definer\n"
    "set search_path = public, pg_temp\n"
    "as $$\n"
    "declare v_compte text;\n"
    "begin\n"
    "  if p_hachage is null or length(p_hachage) <> 64 then\n"
    "    raise exception 'identite';          -- message UNIQUE : jamais un oracle\n"
    "  end if;\n"
    "  select j.compte into v_compte\n"
    "    from public.ft_jetons j\n"
    "   where j.hachage = lower(p_hachage) and j.revoque = false;\n"
    "  if v_compte is null then\n"
    "    raise exception 'identite';          -- absent, inconnu ou revoque : meme refus\n"
    "  end if;\n"
    "  insert into public.ft_comptes(email, data, updated_at)\n"
    "  values (v_compte, p_data - 'token' - 'authCode', now())\n"
    "  on conflict (email) do update\n"
    "    set data = excluded.data, updated_at = now();\n"
    "end;\n"
    "$$;\n"
    "\n"
    "revoke all on function public.ft_enregistrer_instantane(text, jsonb)\n"
    "       from public, anon, authenticated;"))
H.append(tableau(
    ['choix', 'pourquoi'],
    [['elle recoit le <b>hachage</b>, pas le jeton brut',
      'le Worker hache des reception (brief section 14). Le brut n atteint donc jamais la '
      'base - ni dans un parametre, ni dans un journal de requetes'],
     ['aucune adresse en entree',
      'le parametre qui portait le defaut <b>disparait de la signature</b>. On ne verifie '
      'pas une entree dangereuse : on la supprime'],
     ['un seul message de refus',
      'distinguer « inconnu » de « revoque » apprendrait a un inconnu quels jetons existent'],
     ['le retrait des justificatifs est <b>dans la fonction</b>',
      'la porte porte la regle (R2). Elle protege alors <b>tout appelant futur</b>, y '
      'compris celui qu on n a pas prevu - et elle ne coute rien au Worker'],
     ['aucun SQL construit par concatenation, chemin de recherche fixe',
      'meme forme que la fonction existante, qui a ete auditee le 17/09'],
     ['l ancienne fonction n est pas supprimee',
      'Michel : <i>« garder temporairement la fonction inaccessible si utile au rollback '
      '»</i> plutot qu une suppression immediate']],
    [46 * mm, 120 * mm]))
H.append(encadre(
    'LE PIEGE A NE PAS DECOUVRIR EN PRODUCTION, ET IL VIENT D UNE MESURE DU 17/09',
    'La table des comptes a les regles de ligne <b>activees mais non forcees</b> : son '
    'proprietaire les contourne, et c est precisement ce qui fait marcher la fonction '
    'actuelle. >> <b>Forcer les regles sur la table des comptes casserait l ecriture</b>, '
    'alors meme que c est ce qu on recommande pour la table des jetons. Les deux tables '
    'n ont pas le meme reglage, et ce n est pas une incoherence : l une est ecrite par une '
    'fonction au nom de son proprietaire, l autre ne doit etre lue par personne.'))

# ── 12 ───────────────────────────────────────────────────────────────────────────────
H.append(P('12. Droits et regles proposes', 'h1'))
H.append(tableau(
    ['sujet', 'aujourd hui (mesure le 17/09)', 'apres S2-B', 'quand'],
    [['execution de l ancienne fonction par le role public',
      dict(DROITS_ANON)['EXECUTE ft_miroir'], NON, 'phase 5, <b>apres</b> preuve du nouveau chemin'],
     ['lecture directe de la table par le role public',
      dict(DROITS_ANON)['SELECT'] + ' (les lignes restent filtrees par les regles)',
      NON + ' - droit retire', 'phase 6'],
     ['suppression directe', dict(DROITS_ANON)['DELETE'] + ' au sens du droit SQL, mais '
      'refusee faute de regle', NON + ' - droit retire', 'phase 6'],
     ['troncature', dict(DROITS_ANON)['TRUNCATE'] + ' - et les regles de ligne <b>ne s y '
      'appliquent pas</b>', NON + ' - droit retire', 'phase 6'],
     ['contournement des regles', dict(DROITS_ANON)['BYPASSRLS'], 'inchange', '-'],
     ['les deux regles ouvertes en ecriture',
      'presentes, mais <b>inoperantes</b> (le role n a pas le droit SQL correspondant)',
      'supprimees', 'phase 6, avec la raison ecrite (R30)']],
    [40 * mm, 58 * mm, 36 * mm, 32 * mm]))
H.append(encadre(
    'UNE PRECISION QUI N EST PAS UN DETAIL - DROIT SQL ET REGLE DE LIGNE NE SONT PAS LA '
    'MEME COUCHE',
    'Le role public <b>possede</b> le droit de supprimer des lignes ; il en est empeche '
    'uniquement parce qu aucune regle ne l autorise. <b>Une regle ajoutee un jour par '
    'commodite ouvrirait donc la suppression sans que personne ait touche aux droits.</b> '
    'La troncature, elle, n est pas filtree par les regles du tout - sa portee reelle est '
    'neanmoins limitee, parce que le point d entree web n expose pas cette operation : elle '
    'exigerait une connexion directe a la base, donc un justificatif que le navigateur n a '
    'pas. >> <b>Ce n est pas une porte ouverte aujourd hui, c est une porte sans serrure '
    'derriere un mur</b> - et on retire le droit parce qu il ne sert a rien, pas parce qu on '
    'a mesure une exploitation.'))

# ── 13 ───────────────────────────────────────────────────────────────────────────────
H.append(P('13. Transition sans grand soir', 'h1'))
PHASES = [['<b>1</b>', 'table des jetons creee (vide) + fonction creee. Aucun appelant.',
      'rien', 'la table existe, personne ne l atteint'],
     ['<b>2</b>', 'le Worker recoit sa route de sauvegarde et son secret. Hachage inconnu -> '
      'le pont resout, puis <b>inscrit</b> le hachage. Essais sur le compte de test '
      'uniquement.',
      'rien', 'une ecriture aboutie pour le compte de test, <b>et</b> une ligne de registre '
      'creee par cet essai'],
     ['<b>3</b>', '<b>rien a faire</b> : le registre se remplit a l usage. Seule la '
      '<b>revocation</b> demande un geste - elle doit atteindre Supabase de facon bloquante.',
      'rien', 'le nombre de lignes croit, et une revocation refuse des l instant suivant'],
     ['<b>4</b>', 'le client bascule : il appelle le Worker <b>s il a un jeton</b>, sinon il '
      'garde l ancien chemin. Compteur anonyme de la bascule.',
      'rien de visible', 'la part de la nouvelle voie, mesuree'],
     ['<b>5</b>', 'execution de l ancienne fonction retiree au role public.',
      'rien - les appareils sans jeton perdent le <b>miroir</b>, jamais leur sauvegarde',
      '<b>preuve reseau</b> : appel avec la cle publique -> refus'],
     ['<b>6</b>', 'droits directs inutiles retires, regles vestigiales supprimees.',
      'rien', 'nouveau releve des droits']]
# [!!] LA PHASE 3 SE CONTROLE SUR SA PROPRE LIGNE. Ma premiere version en faisait une RECOPIE
#      de masse, incompatible avec l essai par le pont de la phase 2 (voir section 5). Si le
#      mot revenait ici, l incoherence d ordre reviendrait avec lui.
_p3 = [r for r in PHASES if r[0] == '<b>3</b>']
g(len(_p3) == 1 and 'recopie' not in _p3[0][1] and 'a l usage' in _p3[0][1],
  'la phase 3 redevient une recopie du registre : c est l incoherence d ordre corrigee en '
  'section 5, et elle ne se verrait qu au premier essai reel')
g('revocation' in _p3[0][1].lower(),
  'la phase 3 ne nomme plus la revocation, qui est le seul geste qu elle demande vraiment')
g(len(PHASES) == 6, 'la sequence ne compte plus six phases mais %d' % len(PHASES))
H.append(tableau(
    ['phase', 'ce qui se passe', 'ce qui change pour la personne', 'preuve de sortie'],
    PHASES,
    [12 * mm, 62 * mm, 46 * mm, 46 * mm]))
H.append(P('C est la sequence du brief, avec <b>une</b> difference et elle va dans le sens de '
           'la prudence : <b>la phase 3 n est plus un travail, c est une observation.</b> Un '
           'client bascule dont le jeton n est pas encore inscrit n est pas refuse - il passe '
           'par le pont, et son inscription se fait au passage. <i>L ordre entre la phase 3 et '
           'la phase 4 cesse donc d etre un risque, parce qu il n y a plus d ordre a tenir.</i>',
           'p'))
H.append(encadre(
    'CE QUI NE PEUT PAS MAL TOURNER, ET POURQUOI ON PEUT L AFFIRMER',
    'A aucune phase une donnee n est en jeu : le miroir est un <b>filet</b>, la source de '
    'verite reste Apps Script, et le local passe avant les deux (regle d or #3). Le pire '
    'defaut possible de ce chantier est <b>une copie de sauvegarde qui cesse de se mettre a '
    'jour</b> - ce qui est deja le cas pour quiconque est hors ligne. >> Corollaire exige par '
    'le brief : il faut donc que cet echec <b>se voie</b>. La carte d administration affiche '
    'deja le dernier etat du miroir ; elle reste le temoin, et elle doit distinguer « local '
    'sauve » de « miroir en attente ».', VERT))

# ── 14 ───────────────────────────────────────────────────────────────────────────────
H.append(PageBreak())
H.append(P('14. Retour arriere', 'h1'))
H.append(tableau(
    ['si cela tourne mal apres...', 'retour arriere', 'perte'],
    [['phase 1 ou 2', 'supprimer la table et la fonction, ou ne rien faire : personne ne les '
      'appelle', 'aucune'],
     ['phase 3', 'rien a annuler : aucune donnee n a ete deplacee. Le registre d Apps Script '
      'reste la reference', 'aucune'],
     ['phase 4', 'le client revient a l ancienne voie - <b>une seule ligne</b>, et '
      'l ancienne fonction est toujours en place', 'les instantanes non ecrits pendant '
      'l incident, rattrapes a la sauvegarde suivante'],
     ['phase 5', 'redonner l execution au role public - une instruction',
      'aucune ; V2 se rouvre, ce qui est le prix assume d un retour arriere'],
     ['phase 6', 'redonner les droits retires', 'aucune']],
    [34 * mm, 90 * mm, 42 * mm]))
H.append(P('Chaque phase est reversible <b>seule</b>, sans defaire les precedentes. C est la '
           'raison pour laquelle l ancienne fonction n est pas supprimee mais rendue '
           'inaccessible : <i>une suppression est un retour arriere qu on ne peut pas '
           'faire.</i>', 'p'))

# ── 15 ───────────────────────────────────────────────────────────────────────────────
H.append(P('15. Risques', 'h1'))
H.append(tableau(
    ['risque', 'gravite', 'ce qui le contient'],
    [['<b>la revocation n atteint pas Supabase</b> : un appareil retire continue d ecrire',
      '<b>eleve</b> - c est V2 deplacee', 'ecriture bloquante a la revocation + '
      'reconciliation. <b>Le seul point du chantier qui doit echouer FERME</b>'],
     ['une action de sauvegarde non reconnue part au relais attrape-tout du Worker',
      'moyen - un instantane entier partirait chez Google en silence',
      'la nouvelle route est traitee <b>avant</b> le relais, et un temoin le fige'],
     ['le secret du Worker fuite', 'eleve', 'section 4 : l option D permet de le remplacer '
      'sans toucher au code. Rotation possible a tout moment'],
     ['la taille de l instantane depasse ce que le Worker peut traiter',
      AVER + ' - les bornes reelles dependent du plan Cloudflare, invisible d ici',
      'la fonction retire les justificatifs <b>en base</b>, donc le Worker n a pas besoin '
      'd analyser le corps entier'],
     ['les deux registres divergent sans qu on le voie',
      'moyen', 'un compteur compare les deux nombres, lisible dans l administration - '
      '<i>la panne de 2026 qui a coute le plus cher etait une panne silencieuse</i>'],
     ['la ligne de test ecrite par le bouton de diagnostic',
      'faible', 'ce bouton ne pourra plus choisir une adresse : <b>il devra changer ou '
      'partir</b>, et c est une decision a prendre explicitement, pas un effet de bord']],
    [50 * mm, 32 * mm, 84 * mm]))

# ── 16 / 17 ──────────────────────────────────────────────────────────────────────────
H.append(P('16. Tests - et 17. mutations', 'h1'))
H.append(P('Les huit temoins d identite du brief, plus ceux que la mesure a rendus '
           'necessaires. <b>Chacun doit etre eprouve contre une mutation</b> : un temoin '
           'qui ne peut pas rougir ne mesure rien, il rassure (lecon de ft-v994).', 'p'))
H.append(tableau(
    ['temoin', 'mutation qui doit le faire rougir'],
    [['un jeton du compte A ecrit A', 'la fonction prend une autre colonne'],
     ['jeton A + adresse B envoyee quand meme -> ecrit A',
      'le Worker relit une adresse depuis le corps envoye'],
     ['sans jeton -> refus <b>avant</b> toute ecriture', 'le refus passe apres l ecriture'],
     ['jeton invalide -> refus', 'une comparaison approximative'],
     ['jeton revoque -> refus', 'la condition sur la revocation est retiree'],
     ['deux appareils valides ; on en revoque un, l autre continue',
      'la revocation porte sur le compte au lieu du jeton'],
     ['un instantane hostile portant les deux justificatifs ne les stocke jamais',
      'le retrait est enleve de la fonction'],
     ['aucun appel client actif vers l ancienne fonction',
      'un appel direct est remis dans le client'],
     ['aucun secret privilegie dans les fichiers servis',
      'un secret est colle dans un fichier du site'],
     ['une panne Supabase ne bloque ni le local ni Google',
      'l appel devient attendu avant la sauvegarde locale'],
     ['le chemin Google reste entier', 'le transport Apps Script est retire']],
    [78 * mm, 88 * mm]))
H.append(P('<b>Controles negatifs qui doivent rester VERTS</b>, nommes par Michel et dont '
           'l un est deja verifiable aujourd hui : le nom de l ancienne fonction cite '
           'uniquement dans de la documentation ; le mot d un secret privilegie present '
           'dans un <b>commentaire d avertissement</b> - c est le cas reel de '
           + (C % 'supabase.js') + ', mesure ici : le mot y figure, et <b>uniquement</b> en '
           'commentaire ; une adresse employee pour l <b>affichage</b> et non comme '
           'autorite. <i>On mesure le programme, pas le texte</i> - et c est precisement ce '
           'que ce generateur s applique a lui-meme en depouillant les commentaires avant de '
           'compter.', 'p'))

# ── 18 ───────────────────────────────────────────────────────────────────────────────
H.append(P('18. Etapes manuelles - une seule a la fois', 'h1'))
H.append(P('Ce document ne demande <b>aucune</b> ecriture. La premiere etape est une '
           '<b>lecture</b>, et elle conditionne la section 4 : elle dit si l option B existe '
           'reellement dans ce projet, et si la fonction proposee peut s appuyer sur ce qui '
           'est deja installe.', 'p'))
H.append(encadre(
    'ETAPE 1 - LECTURE SEULE. Tableau de bord Supabase -> Project Settings -> API keys',
    'Regarder, et me repondre par OUI ou NON, sans jamais copier une valeur : <b>(a)</b> le '
    'projet propose-t-il plusieurs cles secretes distinctes, ou une seule ? <b>(b)</b> '
    'l interface permet-elle d associer une cle a un role choisi ? >> <b>Ne me copie aucune '
    'cle, aucun secret, aucun mot de passe.</b> Si une capture en montre une, masque-la '
    'avant de l envoyer. Ces deux reponses suffisent a trancher entre l option B et '
    'l option D, et je n en demanderai pas plus a cette etape.', VERT))
H.append(P('Les etapes suivantes viendront <b>une par une</b>, chacune marquee LECTURE ou '
           'ECRITURE, avec ce qu elle fait et ce qu il ne faut surtout pas envoyer. Aucune '
           'instruction d ecriture ne sera proposee tant que la section 4 n est pas tranchee.',
           'petit'))
DETTE = ('<b>Dette du schema (brief section 9).</b> ' + (
         ('S2-B a ouvert ' + (C % 'supabase/migrations/') + ' : <b>' + str(len(MIGS))
          + '</b> migration(s) y sont versionnees, posees <b>avant</b> d etre appliquees, pour '
          'que le texte applique et le texte versionne soient le meme. ')
         if VERSIONNE else
         ('Rien du schema actuel n est dans le depot. S2-B ouvre '
          + (C % 'supabase/migrations/') + '. ')) +
         '<b>La dette de fond reste entiere</b> : ' + (C % 'ft_comptes') + ' et '
         + (C % 'ft_miroir') + ' ont ete creees a la main et ne sont <b>pas</b> versionnees. '
         'Les recrire de memoire fabriquerait une source de verite <b>supposee</b> - le pire '
         'des deux mondes, parce qu elle aurait l air fiable. <b>Consequence assumee</b> : la '
         'garde des dossiers precedents, qui verifiait qu aucun fichier de ce type n existe '
         'dans le depot, a ete <b>retournee, pas supprimee</b>, avec sa raison ecrite '
         '(R30) - elle mesure desormais l absence de SQL <b>egare</b>. <i>Une garde qu on '
         'efface parce qu elle gene est une garde qu on a contournee.</i>')
# [!!] MEME FAUTE QUE POUR L OPTION B, TROUVEE PAR LA MEME MUTATION : « R30 » figure AUSSI
#      dans le tableau des droits, donc une garde globale reste verte alors que c est ICI
#      que la regle compte. On controle donc la PHRASE, pas le document.
g('retournee, pas supprimee' in DETTE and '(R30)' in DETTE,
  'le document ne dit plus que la garde « aucun fichier SQL » doit etre RETOURNEE avec sa '
  'raison ecrite : une garde effacee parce qu elle gene est une garde contournee (R30)')
H.append(P(DETTE, 'p'))

# ── questions ────────────────────────────────────────────────────────────────────────
H.append(PageBreak())
H.append(P('Les quinze questions - etat d AUJOURD HUI, avant toute implementation', 'h1'))
H.append(P('Michel attend ces reponses <b>a la fin</b> de S2-B. Les donner deja comme '
           'acquises serait decrire un chantier qui n a pas eu lieu. Chaque ligne porte donc '
           'l etat mesure aujourd hui <b>et</b> l attendu, separes.', 'p'))

QQ = [
    ('Q1', 'le navigateur peut-il encore choisir le compte avec une adresse ?',
     OUI, NON, 'mesure dans le fichier servi a l instant : le parametre est toujours '
     'renseigne par le client'),
    ('Q2', 'peut-il encore appeler directement l ancienne fonction ?',
     OUI, NON, 'droit d execution mesure le 17/09 : accorde'),
    ('Q3', 'le navigateur possede-t-il un secret privilegie ?',
     NON, NON, '<b>deja vrai</b> : mesure sur les fichiers servis, le mot n apparait que '
     'dans un commentaire d avertissement'),
    ('Q4', 'le jeton brut est-il stocke dans Supabase ?',
     NON, NON, '<b>deja vrai</b> : zero ligne en portait au comptage, et le nettoyage du '
     '17/09 a retire la cle'),
    ('Q5', 'l identite est-elle resolue cote serveur ?',
     NON, OUI, 'aujourd hui elle est fournie par le client'),
    ('Q6', 'jeton A + adresse B peut-il ecrire B ?',
     OUI, NON, 'aucun jeton n intervient sur ce chemin aujourd hui'),
    ('Q7', 'plusieurs appareils d un meme compte fonctionnent-ils ?',
     OUI, OUI, 'le registre S1 est deja « plusieurs jetons par compte » ; S2-B le recopie'),
    ('Q8', 'revoquer un appareil laisse-t-il l autre fonctionner ?',
     OUI, OUI, 'vrai dans S1 ; la contrainte est de <b>propager</b> la revocation (section 3)'),
    ('Q9', 'le role public a-t-il encore l execution de l ancienne fonction ?',
     OUI, NON, 'retire en phase 5, apres preuve du nouveau chemin'),
    ('Q10', 'a-t-il encore des droits directs inutiles sur la table ?',
     OUI, NON, 'lecture, suppression et troncature mesures le 17/09 ; retires en phase 6'),
    ('Q11', 'une panne Supabase bloque-t-elle l application ?',
     NON, NON, '<b>deja vrai</b> : l envoi est lance et oublie, jamais attendu'),
    ('Q12', 'une panne Google bloque-t-elle Supabase ?',
     NON, PART, 'aujourd hui les deux chemins sont independants ; le pont en cree une '
     '<b>volontairement</b>, mais elle ne joue plus que pour un appareil <b>encore inconnu</b> '
     'du registre - <b>elle decroit a l usage</b>, et la strategie 2 la retire'),
    ('Q13', 'la sauvegarde Google fonctionne-t-elle toujours ?',
     OUI, OUI, 'aucun fichier de ce chemin n est touche par ce document'),
    ('Q14', 'V2 est-elle fermee de bout en bout ?',
     NON, NON, '<b>et elle ne peut pas l etre par ce document</b> : Michel exige une preuve '
     'reseau reelle, que le conteneur ne peut pas produire'),
    ('Q15', 'le schema est-il versionne dans le depot ?',
     (PART if VERSIONNE else NON), OUI,
     ('mesure : %d migration(s) versionnee(s) pour ce que S2-B ajoute, mais ft_comptes et '
      'ft_miroir restent non versionnees' % len(MIGS)) if VERSIONNE
     else 'mesure : aucun fichier d instructions de base de donnees dans le depot'),
]
H.append(tableau(
    ['', 'question', 'aujourd hui', 'attendu', 'preuve'],
    [[q, t, a, b, p] for q, t, a, b, p in QQ],
    [9 * mm, 52 * mm, 17 * mm, 17 * mm, 71 * mm]))

H.append(encadre(
    'CE QUE CE DOCUMENT NE FAIT PAS, NOMMEMENT',
    'Aucun fichier servi n est modifie. Aucune table, aucune fonction, aucune regle, aucun '
    'droit, aucune cle, aucun secret. Aucune ecriture sur un compte reel. Rien n est touche '
    'a la nutrition, a la douane, au journal alimentaire, au debrief ni a son idempotence - '
    'qui est un chantier separe et le reste. <b>Et V2 est toujours ouverte</b> : la prochaine '
    'decision revient a Michel, et la premiere chose qu elle demande est une lecture de deux '
    'lignes dans son tableau de bord.'))
H.append(P('Document produit par ' + str(GARDES[0]) + ' gardes qui recomptent chaque fait '
           'depuis le code servi ' + VERSION + ' et refusent de produire si l un tombe - '
           'y compris celle qui verifie que V2 est encore ouverte.', 'petit'))
# @@FIN@@

# ═══════════════════════════════════════════════════════════════════════════════════════
# III. GARDES DE FIN — sur le TEXTE RENDU, prose ET blocs de code
# ═══════════════════════════════════════════════════════════════════════════════════════
TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()
_rendu = (TOUT + ' ' + ' '.join(CODES)).lower()

g('sb_publishable' not in _rendu and 'supabase.co' not in _rendu,
  'une cle ou l URL du projet apparait dans le document')
for m in re.finditer(r'[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}', _rendu):
    g(False, 'une adresse e-mail apparait dans le document : %s' % m.group(0))
for _i in ('select data', 'select email', 'service_role='):
    g(_i not in _rendu, 'le document propose ou expose « %s »' % _i)


def _mentionnee(txt, i):
    o = txt.rfind('«', 0, i)
    return o >= 0 and txt.find('»', o) > i


INTERDITS = [
    (r'v2 est (desormais )?fermee|v2 est corrigee|v2 a ete fermee',
     'le document AFFIRME que V2 est fermee : elle est ouverte a l instant ou il est produit'),
    (r'le schema est (desormais )?versionne|le schema supabase est versionne',
     'le document AFFIRME que le schema est versionne : aucun fichier de ce type n existe '
     'dans le depot'),
    (r'prouve de bout en bout|preuve de bout en bout obtenue',
     'le document AFFIRME une preuve de bout en bout : aucun test reseau n a eu lieu'),
    (r'l option b est disponible|un secret moins privilegie est disponible',
     'le document AFFIRME la disponibilite de l option B : elle est A VERIFIER au tableau '
     'de bord'),
    (r'supabase est le cloud principal|supabase est devenu le cloud principal',
     'le document AFFIRME une bascule qui n a pas eu lieu'),
    (r'le rayon d explosion est reduit par la fonction',
     'le document AFFIRME qu une fonction bornee reduit le rayon d un secret vole : elle '
     'reduit celui d une erreur de programme, ce n est pas la meme couche'),
    (r'une exploitation a ete mesuree|une compromission a ete mesuree',
     'le document AFFIRME une exploitation mesuree : aucune ne l a ete'),
]
for _bloc in TEXTES:
    _b = _bloc.lower()
    for _mot, _msg in INTERDITS:
        for m in re.finditer(_mot, _b):
            deb = max([_b.rfind(c, 0, m.start()) for c in '.?!']
                      + [_b.rfind('<br/>', 0, m.start()) + 4]) + 1
            fin = min([i for i in (_b.find(c, m.end()) for c in '.?!') if i != -1]
                      or [len(_b)])
            interro = _b[deb:fin + 1].rstrip().endswith('?')
            citee = _mentionnee(_b, m.start())
            niee = re.search(r"\bne\b|\bn\b|\bpas\b|\bjamais\b|\bni\b|\bnon\b|\bsi\b"
                             r"|\baucune?\b|\brien\b|\bsans\b|\btant que\b",
                             _b[deb:m.start()])
            g(interro or citee or niee is not None, _msg)

# ── les reponses, verifiees LIGNE PAR LIGNE (jamais « quelque part dans le document ») ──
for _q, _auj, _att in (('Q1', OUI, NON), ('Q2', OUI, NON), ('Q3', NON, NON),
                       ('Q4', NON, NON), ('Q5', NON, OUI), ('Q6', OUI, NON),
                       ('Q7', OUI, OUI), ('Q8', OUI, OUI), ('Q9', OUI, NON),
                       ('Q10', OUI, NON), ('Q11', NON, NON), ('Q12', NON, PART),
                       ('Q13', OUI, OUI), ('Q14', NON, NON),
                       ('Q15', PART if VERSIONNE else NON, OUI)):
    _l = [r for r in QQ if r[0] == _q]
    g(len(_l) == 1, 'la question %s est absente ou en double' % _q)
    g(_l[0][2] == _auj, 'la question %s ne decrit plus l etat d aujourd hui comme %s'
      % (_q, re.sub('<[^>]+>', '', _auj)))
    g(_l[0][3] == _att, 'la question %s n attend plus %s'
      % (_q, re.sub('<[^>]+>', '', _att)))
g(len(QQ) == 15, 'les quinze questions ne sont pas toutes traitees (%d)' % len(QQ))
_q14 = [r for r in QQ if r[0] == 'Q14'][0]
g(_q14[2] == NON and 'conteneur' in _q14[4],
  'Q14 ne dit plus que la preuve reseau est hors de portee du conteneur : c est la seule '
  'reponse honnete depuis ici')
_q12 = [r for r in QQ if r[0] == 'Q12'][0]
g(_q12[3] == PART and 'strategie 2' in _q12[4],
  'Q12 ne dit plus que la dependance est creee volontairement et retiree par la strategie 2')

# ── le vocabulaire sans lequel une section perd son sens ──────────────────────────────
for _mot, _pourquoi in (
        ('option d', 'c est la recommandation de privilege'),
        ('a verifier', 'c est la marque de ce que le conteneur ne peut pas mesurer'),
        ('fail-closed', 'c est la propriete du pont qui le rend utilisable'),
        ('102 %', 'c est la panne qui justifie l independance du miroir'),
        ('oracle', 'c est la raison du message de refus unique'),
        ('r30', 'la garde « aucun fichier SQL » doit etre retournee, pas effacee'),
        ('regle d or #3', 'le local passe avant les deux nuages'),
        ('relais attrape-tout', 'c est le piege propre a ce Worker'),
        ('reconciliation', 'c est ce qui empeche les deux registres de diverger'),
        ('a l usage', 'le registre se remplit par le pont, sans recopie de masse'),
        ('supposee', 'recreer ft_comptes de memoire fabriquerait une fausse source de verite'),
        ('incoherence d ordre', 'le defaut de ma premiere version doit rester ecrit (R30)'),
        ('lecture seule', 'la premiere etape demandee a Michel n ecrit rien')):
    g(_mot in _bt, 'le document ne parle plus de « %s » : %s' % (_mot, _pourquoi))

# ── il doit rester un document d'ARCHITECTURE : aucune instruction d'ecriture proposee ─
_sql_rendu = ' '.join(CODES).lower()
for _w in ('insert into public.ft_comptes(email, data',):
    pass
g('drop table' not in _sql_rendu and 'drop function' not in _sql_rendu,
  'le document propose une suppression : Michel a demande de rendre l ancienne fonction '
  'inaccessible plutot que de la supprimer')
g('delete from' not in _sql_rendu, 'le document propose une suppression de lignes')
g('update public.ft_comptes' not in _sql_rendu,
  'le document propose une mise a jour directe de la table des comptes')

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-B - architecture de fermeture de V2',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, V2 ouverte : %s, portes client : %d, actions Worker : %d, '
      'Worker/Supabase : %d, migrations versionnees : %d, 15 questions)'
      % (OUT, VERSION, GARDES[0], V2_OUVERTE, NB_RPC, NB_ACTIONS, WK_SB, len(MIGS)))
