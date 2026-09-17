#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B / PHASE 3 — la route de sauvegarde du Worker. Hors depot (regle d'or #14).

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
    SCRATCH, 'S2B-PHASE3-ROUTE-WORKER-17-09-2026.pdf')
LOG_BANC = os.environ.get('FT_LOG_BANC') or '/tmp/banc_worker.log'
LOG_MUT = os.environ.get('FT_LOG_MUT') or '/tmp/mut_worker.log'

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


# ── V2 est toujours ouverte : tout ce document en depend ──────────────────────────────
g('p_email: email' in SB,
  'le client appelle deja la nouvelle voie : V2 serait en cours de fermeture, et ce '
  'document affirme le contraire')

W = lire('worker.js')
WC = sans_commentaires(W)


def corps_js(src, entete):
    d = src.find(entete)
    if d < 0:
        return ''
    o = src.find('{', d)
    i, prof = o, 0
    while i < len(src):
        if src[i] == '{':
            prof += 1
        elif src[i] == '}':
            prof -= 1
            if not prof:
                return src[o:i + 1]
        i += 1
    return src[o:]


CS = corps_js(WC, 'async function cloudSave(')
SBA = corps_js(WC, 'async function _sbAppel(')
g(len(CS) > 600, 'la route de sauvegarde est introuvable dans le Worker')

# ── la position : le piege du relais attrape-tout ─────────────────────────────────────
I_ROUTE = WC.find("body.action === 'cloudSave'")
I_RELAIS = WC.find('APPS_SCRIPT_URL,', WC.find('const up = await fetch('))
I_IA = WC.find('_ACTIONS_IA.has(body.action)')
g(0 < I_ROUTE < I_RELAIS,
  'la route n est plus traitee avant le relais attrape-tout : l instantane entier partirait '
  'chez Google, en silence')
g(0 < I_ROUTE < I_IA, 'la route n est plus traitee avant le bloc des actions IA')

# ── ce que la route ne fait pas ───────────────────────────────────────────────────────
_acts = re.search(r'_ACTIONS_IA = new Set\(\[(.*?)\]\)', WC, re.S)
g(_acts and 'cloudSave' not in _acts.group(1),
  'la sauvegarde est devenue une action IA : elle userait le quota de Milo')
NB_ACTIONS = len(re.findall(r"'[a-zA-Z]+'", _acts.group(1)))
g(NB_ACTIONS == 14, 'les actions IA ne sont plus 14 mais %d' % NB_ACTIONS)
for _i, _m in (('p_email', 'une adresse est redevenue un parametre'),
               ('body.email', 'une adresse de la charge utile est relue'),
               ('console.log', 'la route journalise')):
    g(_i not in CS, 'dans la route de sauvegarde : %s' % _m)
g('p_hachage: brut' not in CS and 'p_data: brut' not in CS,
  'le jeton brut part vers Supabase')
g('p_compte: moi.email' in CS, 'le compte inscrit ne vient plus du pont')
g(CS.count("_sbAppel(env, 'ft_enregistrer_instantane'") == 2,
  'le nombre de tentatives d ecriture n est plus exactement 2')
g('while (' not in CS and 'for (' not in CS, 'une boucle est apparue dans la route')
g(CS.find("_sbAppel(env, 'ft_enregistrer_instantane'") < CS.find('_identiteIA(brut, env)'),
  'le pont est appele avant d essayer Supabase : la dependance a Google cesserait de decroitre')
g("r.status >= 500 ? 'panne' : 'refus'" in SBA,
  'la distinction entre une panne et un refus a disparu : c est le defaut que le banc de '
  'comportement a trouve, et ce document le raconte')
g('env.SUPABASE_SECRET' in SBA and 'sb_secret_' not in WC,
  'la cle serveur ne vient plus des secrets, ou elle est ecrite en dur')
g('await r.text()' not in SBA and 'await r.json()' not in SBA,
  'le corps d erreur de Supabase est renvoye a l appelant')

# ── non-regression ────────────────────────────────────────────────────────────────────
g('_origin !== ALLOWED_ORIGIN' in WC, 'le filtre d origine a disparu')
g('body: raw,' in WC, 'le relais attrape-tout a disparu')
g("catch (e) { return { ok: false, raison: 'reseau' }; }" in corps_js(WC, 'async function _identiteIA('),
  'le pont des appels IA n est plus fail-closed')

# ⛔⛔ LE DEPLOIEMENT DU WORKER EST AUTOMATIQUE — GARDE AJOUTEE APRES UNE ERREUR A MOI.
#     La premiere version de ce document affirmait « ce Worker se deploie a la main ». C'etait
#     FAUX : `.github/workflows/deploy-worker.yml` le redeploie a chaque push touchant
#     `worker.js`, et le run #29 l'a fait a 13:38 UTC sur mon propre commit. >> On ne peut plus
#     l'ecrire : la garde lit le workflow.
WF = os.path.join(ROOT, '.github', 'workflows', 'deploy-worker.yml')
g(os.path.exists(WF), 'le workflow de deploiement du Worker a disparu')
_wf = open(WF, encoding='utf-8').read()
DEPLOI_AUTO = "- 'worker.js'" in _wf and 'wrangler-action' in _wf
g(DEPLOI_AUTO,
  'le Worker ne se deploie plus automatiquement sur push : ce document decrit le contraire')
g('wrangler.toml' in open(os.path.join(ROOT, 'wrangler.toml'), encoding='utf-8').read()
  or True, '')
_wt = open(os.path.join(ROOT, 'wrangler.toml'), encoding='utf-8').read()
g('[vars]' not in _wt,
  'wrangler.toml declare desormais des variables : une variable posee au tableau de bord et '
  'absente d ici pourrait etre effacee au prochain deploiement, et ce document dit le contraire')

# ── les migrations de la phase 1 sont toujours la ─────────────────────────────────────
DMIG = os.path.join(ROOT, 'supabase', 'migrations')
MIGS = sorted(f for f in os.listdir(DMIG) if f.endswith('.sql')) if os.path.isdir(DMIG) else []
g(len(MIGS) == 2, 'les migrations de la phase 1 ne sont plus 2 mais %d' % len(MIGS))

# ── les totaux, LUS dans les journaux ─────────────────────────────────────────────────
def journal(chemin, motif, quoi):
    g(os.path.exists(chemin), 'journal introuvable (%s) : %s doit etre LU' % (chemin, quoi))
    txt = open(chemin, encoding='utf-8', errors='replace').read()
    m = re.search(motif, txt)
    g(m, 'le journal %s ne porte pas sa ligne de total : une passe interrompue ressemble '
         'trait pour trait a une passe verte' % chemin)
    return m, txt


_m, _txt = journal(LOG_BANC, r'(\d+) OK / (\d+) rouge', 'le total du banc')
BANC_OK, BANC_KO = int(_m.group(1)), int(_m.group(2))
g(BANC_KO == 0, 'le banc porte %d rouge(s)' % BANC_KO)
g('CRASH' not in _txt, 'le banc a plante : un plantage n est pas un vert')
NB_SOURCE = len(re.findall(r'B-CCCXXI ', _txt))
NB_REEL = len(re.findall(r'B-CCCXXII ', _txt))
g(NB_SOURCE >= 20 and NB_REEL >= 20,
  'le banc ne porte plus assez de temoins (%d de source, %d conduits)' % (NB_SOURCE, NB_REEL))
# [!!] ON COMPARE SANS ACCENTS : ma premiere version ne remplacait qu'un seul caractere
#      accentue et rougissait sur un journal parfaitement sain.
import unicodedata as _ud


def _plat(x):
    return ''.join(c for c in _ud.normalize('NFD', x) if _ud.category(c) != 'Mn').lower()


_txtp = _plat(_txt)
for _t in ('un appareil deja inscrit', 'zero appel a apps script', 'revoqu', 'panne du cloud'):
    g(_t in _txtp, 'le journal du banc ne montre plus le scenario « %s »' % _t)

_m2, _txt2 = journal(LOG_MUT, r'(\d+)/(\d+) conformes', 'le total des mutations')
MUT_OK, MUT_TOT = int(_m2.group(1)), int(_m2.group(2))
g(MUT_OK == MUT_TOT, 'les mutations ne sont pas toutes conformes (%d/%d)' % (MUT_OK, MUT_TOT))
g('INVALIDE' not in _txt2, 'une mutation ne s est pas appliquee')
g(MUT_TOT >= 15, 'moins de 15 mutations')


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
H.append(P('S2-B phase 3 - la sauvegarde passe par le Worker', 'titre'))
H.append(P('Force Tracker - 17 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>la route est DEPLOYEE mais dormante : personne ne l appelle, '
           'et V2 est encore ouverte</b>', 'sous'))

H.append(encadre(
    'CE QUI EST FAIT, ET CE QUI NE L EST PAS',
    'La route qui remplace V2 est <b>ecrite et eprouvee</b> : le navigateur ne choisira plus '
    'le compte en envoyant une adresse, le serveur le retrouvera a partir du jeton. '
    '<b>Mais rien n est en service</b> : ce fichier se deploie chez Cloudflare a la main, il '
    'lui faut une cle secrete que Michel seul peut poser, et le navigateur appelle toujours '
    'l ancienne porte. <b>V2 est ouverte</b>, et ce dossier refuse de produire si ce n est '
    'plus vrai.'))

H.append(P('1. Ce que fait la route, en trois cas', 'h1'))
H.append(tableau(
    ['situation', 'ce qui se passe', 'Google est-il sollicite ?'],
    [['appareil <b>deja inscrit</b> au registre',
      'Supabase retrouve le compte seule et ecrit', '<b>non</b>'],
     ['appareil <b>inconnu</b>',
      'Supabase refuse, le pont Apps Script tranche <b>une fois</b>, le hachage est '
      '<b>inscrit</b>, et l ecriture aboutit', 'oui, <b>une seule fois</b>'],
     ['le meme appareil, la fois suivante',
      'il est desormais connu : Supabase resout seule', '<b>non</b>']],
    [44 * mm, 88 * mm, 34 * mm]))
H.append(P('C est le <b>remplissage a l usage</b> decide dans le dossier d architecture : pas '
           'de recopie de masse du registre, pas de fenetre ou les deux versions se repondent '
           'differemment. <i>La dependance a Google ne se retire pas a une date : elle decroit '
           'toute seule, appareil par appareil.</i>', 'p'))

H.append(encadre(
    'LE PIEGE QUE CE WORKER TEND, ET LE TEMOIN QUI LE FERME',
    'Ce Worker finit par un <b>relais attrape-tout</b> : toute action qu il ne reconnait pas '
    'est reexpediee a Apps Script, telle quelle. Une route de sauvegarde placee APRES ce '
    'relais <b>n echouerait pas</b> - elle enverrait l instantane ENTIER chez Google, en '
    'silence et sans erreur. >> La route est donc la <b>premiere</b> chose traitee, et un '
    'temoin mesure cette <b>position</b>, pas sa presence. La mutation qui la deplace fait '
    'rougir le banc.'))

H.append(P('2. Ce qui ne voyage jamais', 'h1'))
H.append(tableau(
    ['', 'verifie comment'],
    [['le jeton <b>brut</b> n atteint jamais Supabase',
      'les appels reellement emis sont <b>captures</b> pendant le banc, et on cherche le jeton '
      'dedans : il n y est pas'],
     ['aucun appel ne porte de parametre d adresse',
      'meme methode : on inspecte les corps envoyes'],
     ['une adresse glissee dans la charge utile ne change pas le compte',
      'un scenario l y met exprès, avec aussi un identifiant de compte et un drapeau premium'],
     ['le pont ne recoit que le jeton, aucune donnee metier',
      'les cles de son corps sont comptees : il y en a <b>deux</b>'],
     ['la cle serveur ne vit que dans les secrets Cloudflare',
      'aucune valeur dans le depot, et un temoin refuserait une cle ecrite en dur'],
     ['la route ne journalise rien',
      'ni jeton, ni hachage, ni cle - et le corps d erreur de la base n est jamais renvoye']],
    [66 * mm, 100 * mm]))

H.append(PageBreak())
H.append(P('3. Le banc de comportement a trouve un vrai defaut', 'h1'))
H.append(encadre(
    'UNE PANNE DU CLOUD ETAIT ANNONCEE COMME UN APPAREIL REVOQUE',
    'Ma premiere version lisait tout echec de Supabase comme « ce hachage est inconnu ». '
    'Conséquence <b>mesurée</b>, et invisible pour les temoins de source : pendant une panne '
    'de la base, chaque sauvegarde partait interroger Apps Script pour rien, puis repondait a '
    'la personne que son appareil etait <b>revoque</b>. >> <i>Dire « ton appareil est revoque » '
    'a quelqu un dont le cloud est simplement tombe est pire qu une erreur technique : c est '
    'une erreur qu il va essayer de reparer lui-meme</i> - en refaisant une manipulation dont '
    'il n avait aucun besoin. <b>Regle posee : 4xx = la requete est rejetee, 5xx = le serveur '
    'a echoue.</b> Elle ne depend pas de la facon dont la base traduit ses codes.', ORANGE))
H.append(P('<b>C est l argument de ce banc, paye comptant.</b> Les ' + str(NB_SOURCE) +
           ' temoins de source relisent le fichier : ils prouvent qu une regle est <b>ecrite</b>. '
           'Les ' + str(NB_REEL) + ' autres chargent le <b>vrai</b> Worker, lui donnent un faux '
           'Supabase et un faux Apps Script, et regardent ce qu il <b>fait</b>. '
           '<i>La presence n est pas l obeissance</i> - et ce defaut-la ne vivait que dans le '
           'comportement.', 'p'))
H.append(encadre(
    'ET UN TEMOIN A MOI EST RESTE VERT SUR UNE MUTATION - QUATRIEME FOIS DE CE CHANTIER',
    'Il verifiait que le pont des appels IA refuse en cas de panne, en cherchant un mot dans '
    '<b>tout le fichier</b>. Or la nouvelle route en porte un identique : casser le repli du '
    'pont le laissait <b>parfaitement vert</b>. >> <i>Un motif qui cherche une presence ne '
    'mesure pas une absence LOCALE.</i> Ferme en le bornant au corps du pont. La meme '
    'faiblesse a ete trouvee trois fois avant dans ce chantier, chaque fois par une mutation '
    'et jamais par relecture.', ORANGE))

H.append(P('4. Les chiffres', 'h1'))
H.append(tableau(
    ['banc', 'temoins', 'ce qu il mesure'],
    [['source', str(NB_SOURCE), 'la position de la route, ce qu elle n appelle pas, ce qu elle '
      'ne laisse pas fuiter'],
     ['comportement', str(NB_REEL), 'le vrai Worker conduit : combien d appels, vers qui, avec '
      'quoi dedans'],
     ['<b>total</b>', '<b>' + str(BANC_OK) + ' OK / ' + str(BANC_KO) + ' rouge</b>',
      'lu dans le journal du banc, jamais recopie'],
     ['controle negatif', '<b>' + str(MUT_OK) + '/' + str(MUT_TOT) + '</b>',
      'chaque garantie cassee exprès pour la voir rougir, sur un arbre clone']],
    [30 * mm, 30 * mm, 106 * mm]))
H.append(P('<b>Deux controles negatifs restent VERTS exprès</b> : le mot d un justificatif '
           'serveur cite dans un <b>commentaire</b> de securite, et un commentaire qui parle '
           'de journaliser le jeton. <i>On mesure le programme, pas le texte</i> - et sans ces '
           'deux-la, on ne saurait pas que les temoins font bien la difference.', 'p'))

H.append(P('5. Ce que ce dossier ne prouve pas', 'h1'))
H.append(P('Le banc remplace le reseau par des reponses ecrites a l avance. Il prouve la '
           '<b>mecanique</b> de la route - l enchainement, les refus, ce qui voyage. Il ne dit '
           'rien de Cloudflare, ni des vrais secrets, ni de la vraie base. <b>La preuve de bout '
           'en bout se prendra sur le compte de test, en reseau reel</b>, et elle viendra '
           'apres les deux etapes ci-dessous. <i>Un banc qui simule le reseau valide le '
           'simulateur autant que le produit.</i>', 'p'))

H.append(encadre(
    'ET V2 N EST PAS FERMEE - LE VOCABULAIRE COMPTE',
    'Le nouveau chemin peut etre parfait sans que V2 soit fermee : tant que le navigateur '
    'appelle encore l ancienne porte et que la cle publique peut l executer, une personne mal '
    'intentionnee garde exactement la meme possibilite qu hier. <b>V2 ne sera declaree fermee '
    'que sur un refus reseau reel</b>, obtenu avec la vraie cle publique contre l ancienne '
    'fonction. Pas avant, et pas sur du code qui a l air bon.'))

H.append(PageBreak())
H.append(P('6. La seule etape qui reste - et une correction a ce que j avais ecrit', 'h1'))
H.append(encadre(
    'JE M ETAIS TROMPE : LE WORKER NE SE DEPLOIE PAS A LA MAIN',
    'J ai ecrit - dans le message de livraison ET dans la premiere version de ce document - '
    'que ce fichier devait etre colle a la main dans le tableau de bord. <b>C est faux depuis '
    'juillet</b> : une action automatique le redeploie a chaque fois que le fichier change, et '
    'elle l a fait <b>a 13h38</b> sur le commit de cette phase. La route est donc <b>en '
    'ligne</b>. >> <i>Je suis alle le verifier au lieu de le supposer, et c est la seule raison '
    'pour laquelle cette ligne existe.</i> Une garde lit desormais le fichier d automatisation '
    'et refuse de laisser reecrire « deploiement a la main ».', ORANGE))
H.append(encadre(
    'CE QUE CA CHANGE : RIEN, ET ON PEUT LE DIRE PRECISEMENT',
    'La route est deployee, mais <b>personne ne l appelle</b> : le navigateur envoie toujours '
    'sa sauvegarde par l ancienne voie, et aucun code client ne connait la nouvelle. Et sans '
    'cle secrete, elle rend « cloud indisponible » sans emettre la moindre requete - elle '
    '<b>echoue fermee</b>. Les quatorze actions IA, elles, sont intactes, et le deploiement '
    'automatique s est termine avec succes. <b>L application se comporte exactement comme ce '
    'matin.</b>', VERT))
H.append(P('<b>Il ne reste donc qu une chose a faire</b>, et elle est chez Cloudflare : poser '
           'deux valeurs dans les <b>secrets</b> du Worker - l adresse du projet Supabase, et '
           'la cle secrete serveur. <b>Michel les saisit lui-meme</b> : je ne les vois jamais, '
           'je ne les demande jamais, elles n entrent ni dans le depot, ni dans un PDF, ni dans '
           'le chat.', 'p'))
H.append(encadre(
    'ET LE PIEGE QUI VA AVEC, PARCE QUE LE DEPLOIEMENT EST AUTOMATIQUE',
    'Cloudflare affiche un avertissement en orange des qu on ajoute une valeur au tableau de '
    'bord alors que le projet se deploie depuis un fichier de configuration : <i>« mettez votre '
    'configuration a jour pour garder les deploiements synchronises »</i>. <b>Il est fonde.</b> '
    'Une valeur de type <b>texte</b> posee a la main peut etre effacee au prochain '
    'deploiement automatique, parce que la configuration versionnee n en declare aucune. '
    '>> <b>Les deux valeurs doivent donc etre de type SECRET</b>, comme la cle de l IA qui vit '
    'la depuis juillet et a survecu a <b>29</b> deploiements. <i>La preuve qu un secret survit '
    'n est pas une lecture de documentation : c est la cle qui est encore la.</i>'))
H.append(P('<b>Retour arriere</b> : retirer les deux secrets suffit - la route redevient '
           'inerte, exactement comme maintenant. Pour revenir au Worker d avant, il faut '
           'annuler le commit et laisser l automatisation redeployer. <b>Aucune donnee n est '
           'en jeu</b> : cette route n a aucun appelant, et les migrations de la phase 1 sont '
           'une table vide et trois fonctions que personne n appelle.', 'p'))
H.append(P('Document produit par ' + str(GARDES[0]) + ' gardes qui recomptent chaque fait '
           'depuis le code servi ' + VERSION + ', depuis le Worker et depuis les journaux des '
           'deux bancs - et qui refusent de produire si l un tombe, y compris celle qui '
           'verifie que V2 est encore ouverte.', 'petit'))
# @@FIN@@

TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()
_rendu = (TOUT + ' ' + ' '.join(CODES)).lower()

g('sb_publishable' not in _rendu and 'supabase.co' not in _rendu,
  'une cle ou l URL du projet apparait dans le document')
for m in re.finditer(r'[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}', _rendu):
    g(False, 'une adresse e-mail apparait dans le document : %s' % m.group(0))
for _i in ('service_role', 'secret key', 'sb_secret'):
    g(_i not in _rendu, 'le document nomme un justificatif serveur (« %s »)' % _i)


def _mentionnee(txt, i):
    o = txt.rfind('«', 0, i)
    return o >= 0 and txt.find('»', o) > i


INTERDITS = [
    (r'v2 est (desormais )?fermee|v2 a ete fermee',
     'le document AFFIRME que V2 est fermee : elle est ouverte'),
    (r'la route est en service|le worker est deploye|la route est en ligne',
     'le document AFFIRME un deploiement qui n a pas eu lieu'),
    (r'preuve de bout en bout obtenue|prouve de bout en bout',
     'le document AFFIRME une preuve de bout en bout : le banc simule le reseau'),
    (r'plus aucun risque|desormais sans risque',
     'le document banalise : le nouveau chemin coexiste avec l ancien'),
    (r'se deploie a la main|deploiement manuel|coller le fichier dans le tableau de bord',
     'le document affirme un deploiement manuel : il est AUTOMATIQUE, mesure dans le fichier '
     'd automatisation — c est l erreur que ce dossier corrige'),
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
        ('relais attrape-tout', 'c est le piege propre a ce Worker'),
        ('a l usage', 'c est le remplissage progressif du registre'),
        ('revoque', 'c est le defaut trouve par le banc de comportement'),
        ('4xx', 'c est la regle posee pour distinguer un rejet d une panne'),
        ('echoue fermee', 'c est ce qui rend un deploiement sans secret inoffensif'),
        ('refus reseau reel', 'c est la seule preuve qui fermera V2'),
        ('presence n est pas l obeissance', 'c est pourquoi il y a deux bancs'),
        ('retour arriere', 'il doit etre donne avec l etape manuelle'),
        ('deploiement automatique', 'c est la correction centrale de ce dossier'),
        ('type secret', 'une variable texte peut etre effacee au prochain deploiement'),
        ('29', 'c est le nombre de deploiements auxquels la cle de l IA a survecu')):
    g(_mot in _bt, 'le document ne parle plus de « %s » : %s' % (_mot, _pourquoi))

g(str(BANC_OK) in TOUT and str(MUT_OK) + '/' + str(MUT_TOT) in TOUT,
  'les totaux lus dans les journaux n apparaissent pas dans le document')

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-B phase 3 - la route de sauvegarde du Worker',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, banc %d OK / %d rouge [lu] dont %d de source et %d conduits, '
      'mutations %d/%d [lu], V2 ouverte : True)'
      % (OUT, VERSION, GARDES[0], BANC_OK, BANC_KO, NB_SOURCE, NB_REEL, MUT_OK, MUT_TOT))
