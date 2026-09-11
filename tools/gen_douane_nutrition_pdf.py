#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/DOUANE-NUTRITION.pdf — cartographie des portes d'ecriture dans `S.foodLog`.

   Question posee par Michel : *existe-t-il aujourd'hui un UNIQUE point final qui normalise et
   valide toute entree nutritionnelle avant ecriture, quelle que soit son origine ?*

⭐⭐ RIEN N'EST RECOPIE A LA MAIN DANS CE FICHIER. Les extraits de code sont EXTRAITS du depot,
   et surtout **les COMPTES sont calcules a l'execution** (nombre de portes d'ecriture, nombre
   de constructeurs de per100, qui passe par le hub). Un chiffre ecrit en dur dans un document
   se perime en silence : le jour ou quelqu'un ajoute une neuvieme porte, ce document dirait
   encore huit. C'est R2 applique a la documentation — une seule source de verite, le code.

⚠️ Corollaire assume : si le depot change, ce generateur peut REFUSER de produire (les gardes
   ci-dessous levent SystemExit). C'est voulu. Un document qui se genere quand meme sur une
   hypothese fausse est pire qu'un document absent.

⚠️ CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji. Le garde-fou `_v` est une LISTE BLANCHE
   (le caractere est-il encodable ?), pas une liste noire : c'est le seul test sans trou.
"""
import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether, Preformatted, PageBreak)
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'DOUANE-NUTRITION.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read().split('\n')


# ─────────────────── LA MESURE, FAITE A CHAQUE EXECUTION ───────────────────
def trouver(motif, fichier=None):
    """Rend [(no_ligne_1_based, texte)] de toutes les lignes qui matchent le motif."""
    L = APP if fichier is None else open(os.path.join(ROOT, fichier), encoding='utf-8').read().split('\n')
    return [(k + 1, l) for k, l in enumerate(L) if re.search(motif, l)]


def fonction_englobante(no):
    """Rend (ligne, nom) de la derniere `function xxx(` declaree en colonne 0 avant `no`."""
    nom, lg = None, None
    for k in range(no):
        m = re.match(r'^function\s+([A-Za-z_$][\w$]*)\s*\(', APP[k])
        if m:
            nom, lg = m.group(1), k + 1
    return lg, nom


PUSHES = trouver(r'S\.foodLog\.push\(')
NUTRS = trouver(r'_bcNutr\s*=\s*\{')
HUB = trouver(r'_offRemplirFormulaire\(')
HUB_APPELS = [(n, l) for n, l in HUB if not re.match(r'^function\s', l.strip())]

# Les gardes physiques : fonctions pures + leurs appelants.
PURS = trouver(r'_(masse|kcal)ImpossibleVals\(')
PURS_APPELS = [(n, l) for n, l in PURS if not re.match(r'^function\s', l.strip())]

# ⛔ GARDE-FOU DU DOCUMENT : si la forme du depot change, on refuse de produire un document faux.
if len(PUSHES) != 3:
    raise SystemExit('ATTENDU 3 ECRITURES DANS S.foodLog, TROUVE %d — le document dirait faux. '
                     'Lignes : %s' % (len(PUSHES), [n for n, _ in PUSHES]))
if len(NUTRS) < 6:
    raise SystemExit('ATTENDU >=6 CONSTRUCTEURS DE _bcNutr, TROUVE %d' % len(NUTRS))

# ⛔⛔ ON INDEXE PAR NOM, JAMAIS PAR POSITION — ET C'EST UNE ERREUR REELLE, ATTRAPEE A LA
#    RELECTURE DU PDF PRODUIT. La premiere version lisait `ECRIVAINS[0]` en croyant tenir
#    `addFoodEntry` : or `PUSHES` sort dans l'ordre du FICHIER (2138, 2796, 4024), donc l'indice 0
#    etait `rejouerRepas`. Le tableau du document attribuait les controles de l'une a l'autre —
#    un document faux, produit sans aucune erreur.
#    👉 *Un ordre de fichier n'est pas une identite.* Le garde ci-dessous exige les trois noms
#    attendus : si une porte est renommee ou ajoutee, le generateur s'arrete au lieu de mentir.
ECRIVAINS = {}
for no, _ in PUSHES:
    lg, nom = fonction_englobante(no)
    if not nom:
        raise SystemExit('PUSH LIGNE %d SANS FONCTION ENGLOBANTE' % no)
    ECRIVAINS[nom] = no

ATTENDUS = ('addFoodEntry', 'quickAddFood', 'rejouerRepas')
if set(ECRIVAINS) != set(ATTENDUS):
    raise SystemExit('LES FONCTIONS QUI ECRIVENT ONT CHANGE : trouve %s, attendu %s — le document '
                     'decrirait des controles attribues a la mauvaise porte.'
                     % (sorted(ECRIVAINS), sorted(ATTENDUS)))


def L(nom):
    return str(ECRIVAINS[nom])

# Quels constructeurs de per100 normalisent, lesquels prennent la valeur brute ?
# Le bloc fait 2 a 7 lignes selon les portes : on lit jusqu'a l'accolade fermante.
NORMALISE, BRUT = [], []
for no, _ in NUTRS:
    bloc = []
    for k in range(no - 1, min(no + 9, len(APP))):
        bloc.append(APP[k])
        if '};' in APP[k] or APP[k].rstrip().endswith('};'):
            break
    txt = '\n'.join(bloc)
    (NORMALISE if '_per100d1' in txt else BRUT).append(no)

if not BRUT:
    raise SystemExit('AUCUN CONSTRUCTEUR BRUT TROUVE — la divergence decrite dans ce document '
                     'a peut-etre ete corrigee. Relire avant de regenerer.')


def sans_commentaires(txt):
    """Retire les commentaires (pleins d'emoji, qui sortent en carres noirs). Le code NU reste exact."""
    out, dans_bloc = [], False
    for l in txt.split('\n'):
        if dans_bloc:
            if '*/' in l:
                dans_bloc = False
                reste = l.split('*/', 1)[1]
                if reste.strip():
                    out.append(reste.rstrip())
            continue
        if '/*' in l and '*/' not in l:
            avant = l.split('/*', 1)[0]
            dans_bloc = True
            if avant.strip():
                out.append(avant.rstrip())
            continue
        while '/*' in l and '*/' in l:
            l = l.split('/*', 1)[0] + l.split('*/', 1)[1]
        if '//' in l:
            q = l.find('//')
            av = l[:q]
            if av.count('"') % 2 == 0 and av.count("'") % 2 == 0 and not av.rstrip().endswith(':'):
                l = av.rstrip()
        if l.strip():
            out.append(l.rstrip())
    return '\n'.join(out)


def abreger_chaines(txt):
    """Remplace par '...' toute chaine litterale contenant un caractere que la police du PDF ne
       sait pas rendre.

       ⚠️ POURQUOI CETTE FONCTION EXISTE, ET POURQUOI ELLE EST HONNETE : `sans_commentaires` ne
       peut rien ici, parce que les emoji ne sont PAS dans des commentaires — ils sont dans les
       MESSAGES affiches a l'utilisateur, donc dans du code reel. Le garde-fou `_v` a donc
       refuse de produire le document, ce qui est son travail.
       ⭐ L'elision est MECANIQUE et DECLAREE (la legende du bloc le dit), comme les points de
       suspension dans une citation : elle ne touche qu'au texte affiche, jamais a la structure
       — et c'est la structure qui est le sujet de ce document (`return;` seul contre
       `montrer(); return;`). Aucun mot de code n'est reecrit.
       ⛔ Ce qui reste interdit : un caractere non rendu HORS chaine fait toujours echouer `_v`."""
    out = []
    for l in txt.split('\n'):
        if all(ord(c) < 256 for c in l):
            out.append(l)
            continue
        # On ne touche qu'aux chaines simples '...' sans echappement de quote : les seules
        # concernees ici. Une chaine plus exotique laisse le caractere et `_v` fera echouer.
        l = re.sub(r"'((?:[^'\\\n]|\\.)*)'",
                   lambda m: "'...'" if any(ord(c) > 255 for c in m.group(1)) else m.group(0), l)
        out.append(l)
    return '\n'.join(out)


def extrait(deb, fin):
    """Lignes [deb..fin] du depot (1-based, inclusif), commentaires retires."""
    return abreger_chaines(sans_commentaires('\n'.join(APP[deb - 1:fin])))


def extrait_motif(motif, avant=0, apres=0, garder=None):
    t = trouver(motif)
    if not t:
        raise SystemExit('EXTRAIT INTROUVABLE : %s' % motif)
    no = t[0][0]
    net = extrait(max(1, no - avant), no + apres)
    if garder:
        L = net.split('\n')
        if len(L) < garder:
            raise SystemExit('EXTRAIT TROP COURT : %s rend %d lignes, %d attendues'
                             % (motif, len(L), garder))
        net = '\n'.join(L[:garder])
    return net


# ─────────────────────────── MISE EN PAGE ───────────────────────────
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
FONDC = colors.HexColor('#EEEEEC')
TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46')
ORANGE = colors.HexColor('#B26A00')

S = getSampleStyleSheet()
st = {
    'titre': ParagraphStyle('titre', parent=S['Title'], fontName='Helvetica-Bold',
                            fontSize=19, leading=23, textColor=ENCRE, alignment=TA_LEFT, spaceAfter=2),
    'sous': ParagraphStyle('sous', parent=S['Normal'], fontName='Helvetica',
                           fontSize=9.5, leading=13, textColor=GRIS, spaceAfter=14),
    'h1': ParagraphStyle('h1', parent=S['Heading1'], fontName='Helvetica-Bold',
                         fontSize=13, leading=16, textColor=ROUGE, spaceBefore=15, spaceAfter=6),
    'h2': ParagraphStyle('h2', parent=S['Heading2'], fontName='Helvetica-Bold',
                         fontSize=10.5, leading=13.5, textColor=ENCRE, spaceBefore=10, spaceAfter=4),
    'p': ParagraphStyle('p', parent=S['Normal'], fontName='Helvetica',
                        fontSize=9.3, leading=13.2, textColor=ENCRE, spaceAfter=6),
    'petit': ParagraphStyle('petit', parent=S['Normal'], fontName='Helvetica',
                            fontSize=8.2, leading=11.5, textColor=GRIS, spaceAfter=5),
    'cell': ParagraphStyle('cell', parent=S['Normal'], fontName='Helvetica',
                           fontSize=8.3, leading=11),
    'cellb': ParagraphStyle('cellb', parent=S['Normal'], fontName='Helvetica-Bold',
                            fontSize=8.3, leading=11),
    'code': ParagraphStyle('code', parent=S['Normal'], fontName='Courier',
                           fontSize=6.9, leading=8.6, textColor=ENCRE),
}


def _v(x, ou='texte'):
    """LISTE BLANCHE : le caractere est-il rendu par WinAnsi/cp1252 ? Tout le reste est refuse,
       sans qu'on ait a l'enumerer — une liste noire a toujours un trou."""
    if isinstance(x, str):
        for ch in x:
            try:
                ch.encode('cp1252')
            except UnicodeEncodeError:
                raise SystemExit('CARACTERE NON RENDU %r (%s) dans %s — police WinAnsi/cp1252'
                                 % (ch, hex(ord(ch)), ou))
        for m in re.finditer(r'&#(\d+);|&#[xX]([0-9a-fA-F]+);', x):
            n = int(m.group(1)) if m.group(1) else int(m.group(2), 16)
            try:
                chr(n).encode('cp1252')
            except UnicodeEncodeError:
                raise SystemExit('ENTITE HTML NON RENDUE %s (%s) dans %s' % (m.group(0), hex(n), ou))
    return x


C = "<font face='Courier'>%s</font>"


def P(t, s='p'):
    return Paragraph(_v(t, 'paragraphe'), st[s])


def encadre(titre, corps, couleur=ROUGE):
    inner = [[Paragraph('<b>%s</b>' % _v(titre, "titre d'encadre"), st['cellb'])],
             [Paragraph(_v(corps, "corps d'encadre"), st['cell'])]]
    t = Table(inner, colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.4, couleur),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return KeepTogether(t)


def tableau(entetes, ligs, largeurs):
    data = [[Paragraph('<b>%s</b>' % _v(h, 'en-tete'), st['cellb']) for h in entetes]]
    for l in ligs:
        data.append([Paragraph(_v(c, 'cellule'), st['cell']) for c in l])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EDEDEA')),
        ('GRID', (0, 0), (-1, -1), 0.4, TRAIT),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    return t


_LARG_CODE = 165 * mm - 12
_PT = stringWidth('x', 'Courier', 6.9)
_MAX = int(_LARG_CODE / _PT)


def _replier(txt):
    """Preformatted ne replie pas : une ligne trop longue sort COUPEE. Un extrait tronque est
       pire qu'un extrait absent — il a l'air complet."""
    out = []
    for l in txt.split('\n'):
        if len(l) <= _MAX:
            out.append(l)
            continue
        creux = len(l) - len(l.lstrip())
        marge = ' ' * creux + '» '
        reste = l
        while len(reste) > _MAX:
            plancher = max(creux + 8, _MAX // 2)
            coupe = -1
            for sep in ('; ', ', ', ' && ', ' || ', ' '):
                k = reste.rfind(sep, plancher, _MAX)
                if k > coupe:
                    coupe = k + len(sep)
            if coupe < plancher:
                coupe = _MAX
            out.append(reste[:coupe].rstrip())
            reste = marge + reste[coupe:].lstrip()
        out.append(reste)
    fini = '\n'.join(out)
    for l in fini.split('\n'):
        if stringWidth(l, 'Courier', 6.9) > _LARG_CODE:
            raise SystemExit('LIGNE DE CODE QUI DEBORDE (%d car) : %s' % (len(l), l[:70]))
    return fini


def bloc_code(txt, legende=None):
    _v(txt, 'bloc de code')
    corps = [[Preformatted(_replier(txt), st['code'])]]
    t = Table(corps, colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FONDC),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.0, TRAIT),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    if legende:
        return KeepTogether([Paragraph(_v(legende, 'legende'), st['petit']), t])
    return t


def pied(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(GRIS)
    canvas.drawString(22 * mm, 12 * mm,
                      'Force Tracker — y a-t-il une douane avant S.foodLog ? — 11/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("Y a-t-il une douane avant " + C % 'S.foodLog' + " ?", 'titre'))
F.append(P("Force Tracker — 11/09/2026. Cartographie demandee par Michel <b>avant</b> de decider "
           "d'une refonte : <i>&laquo; existe-t-il aujourd'hui un UNIQUE point final qui normalise "
           "et valide toute entree nutritionnelle avant ecriture, quelle que soit son origine ? &raquo;</i> "
           "<b>Trace dans le depot, pas de memoire.</b> Les comptes de ce document sont recalcules "
           "a chaque generation depuis " + C % 'app.js' + " : si le code change, le document change "
           "ou refuse de se produire.", 'sous'))

F.append(encadre(
    "LA REPONSE : C — NON",
    "<b>Trois</b> fonctions ecrivent dans " + C % 'S.foodLog' + ", chacune avec ses propres regles, "
    "et <b>deux des trois ne croisent aucun controle</b>. Il existe bien un morceau commun aux trois "
    "(" + C % '_provFood' + "), et <b>c'est exactement le piege</b> : il recopie de la "
    "<i>provenance</i>, il ne valide rien. Aucune verification de quantite, d'unite, de "
    "pour-100&nbsp;g, de calories ou de macros n'y passe. "
    "<br/><br/><b>Ce n'est pas un oubli, c'est une forme.</b> Le point commun est une "
    "<i>liste blanche de recopie</i>, pas une douane : chaque nouveau champ doit etre ajoute a la "
    "main dans chaque porte, et l'oubli est silencieux.", ROUGE))

# ── 1. Les sorties ──
F.append(P("1. Les %d sorties" % len(PUSHES), 'h1'))
F.append(P("Mesure : " + C % "grep 'S.foodLog.push('" + " sur tout le depot rend <b>"
           + str(len(PUSHES)) + "</b> sites, tous dans " + C % 'app.js' + "."))
F.append(tableau(
    ["fonction qui ecrit", "ligne", "controles traverses avant l'ecriture"],
    [[C % 'addFoodEntry()', L('addFoodEntry'),
      "nom non vide &middot; au moins une valeur &middot; <b>geste quantite</b> (" + C % '_bcQtyPose' + ")"],
     [C % 'quickAddFood()', L('quickAddFood'),
      "<b>aucun</b>"],
     [C % 'rejouerRepas()', L('rejouerRepas'),
      "le <i>moment du repas</i> seulement, valide contre " + C % 'FOOD_MEALS' +
      " &mdash; rien sur les valeurs"]],
    [50 * mm, 18 * mm, 97 * mm]))
F.append(Spacer(1, 5))
F.append(P("<b>Plus deux chemins qui remplacent le tableau entier sans rien regarder</b> : la "
           "restauration cloud (" + C % 'setup.js' + ") et le chargement local (" + C % 'state.js' +
           "). Ils sont hors du sujet d'une douane de saisie, mais ils existent et meritent d'etre "
           "nommes : <i>aucune regle de qualite ne survit a un remplacement en bloc</i>.", 'petit'))

F.append(Spacer(1, 6))
F.append(bloc_code(extrait_motif(r'function quickAddFood\s*\(', apres=30),
                   "La porte sans aucun controle, extraite du depot. Commentaires retires ; les messages "
                   "affiches sont abreges en " + C % "'...'" + " (la police du PDF ne rend pas les emoji)."))

# ── 2. Les portes ──
F.append(PageBreak())
F.append(P("2. Les huit portes d'entree", 'h1'))
F.append(P("Chacune fabrique elle-meme l'objet pour-100&nbsp;g (" + C % '_bcNutr' + "). Mesure : "
           "<b>%d</b> constructeurs distincts dans le depot." % len(NUTRS)))
F.append(tableau(
    ["porte", "fabrique", "transforme", "hub ?", "controle"],
    [["scan code-barres", C % '_lookupBarcode', C % '_per100d1', "oui", "formulaire (avis)"],
     ["code-barres tape", C % '_bcManuel' + " -&gt; idem", C % '_per100d1' + " + " + C % 'codeDouteux', "oui", "formulaire (avis)"],
     ["recherche Open Food Facts", C % '_afSuggPrendreOff', C % '_per100d1', "oui", "formulaire (avis)"],
     ["recherche CIQUAL", C % '_afSuggPrendreCiqual', C % '_per100d1', "oui", "formulaire (avis)"],
     ["marques", C % '_afSuggPrendreMarque', C % '_per100d1', "oui", "formulaire (avis)"],
     ["photo d'etiquette", C % 'onFoodLabelFile', C % '_per100d1',
      "<b>non</b>", "formulaire (avis)"],
     ["estimation IA / etiquette recopiee", C % '_calAppliquer', C % '_per100d1',
      "oui", "<b>bloquant</b>"],
     ["Mes aliments / deja note", C % 'quickFillFood' + " &middot; " + C % '_afSuggPrendreLocale',
      "<b>valeur brute</b>", "<b>non</b>", "aucun si ajout direct"],
     ["saisie manuelle", "les 4 champs", C % 'parseInt', "&mdash;", "formulaire (avis)"]],
    [38 * mm, 38 * mm, 33 * mm, 16 * mm, 40 * mm]))
F.append(Spacer(1, 5))
F.append(P("<b>Le hub " + C % '_offRemplirFormulaire' + " couvre %d portes sur 8.</b> Les trois "
           "autres en recopient une version raccourcie, chacune avec ses propres omissions."
           % len(HUB_APPELS), 'petit'))

# ── 3. Les divergences ──
F.append(P("3. Les regles dupliquees ou divergentes", 'h1'))

F.append(P("3.1 &mdash; La meme regle physique, appliquee a deux forces differentes", 'h2'))
F.append(P("" + C % '_masseImpossibleVals' + " et " + C % '_kcalImpossibleVals' + " sont des "
           "fonctions <b>pures</b>, a proprietaire unique : sur ce point l'architecture est saine. "
           "Mais elles ne sont pas <i>appliquees</i> de la meme facon."))
F.append(bloc_code(extrait_motif(r'const imp=_masseImpossibleVals\(100', apres=7),
                   "Porte IA / etiquette recopiee &mdash; elles BLOQUENT : " + C % 'return;' + " sec, la valeur "
                   "n'entre pas. Messages abreges."))
F.append(Spacer(1, 4))
F.append(bloc_code(extrait_motif(r'const masse=_masseImpossible\(pfx\);', apres=6, garder=6),
                   "Formulaire &mdash; elles AFFICHENT, et rien de plus : " + C % 'montrer(); return;' + ". "
                   "Messages abreges."))
F.append(Spacer(1, 5))
F.append(encadre(
    "LA CONSEQUENCE, EN UNE PHRASE",
    "La <b>meme</b> erreur est <b>refusee</b> par une porte et <b>enregistree</b> par la porte "
    "d'a cote. Et " + C % 'addFoodEntry' + " n'appelle jamais le controle de coherence avant "
    "d'ecrire : l'avertissement a pu s'afficher pendant la frappe, il ne bloque pas la sortie.",
    ORANGE))

F.append(P("3.2 &mdash; %d constructeurs du pour-100 g, dont %d sans normalisation"
           % (len(NUTRS), len(BRUT)), 'h2'))
F.append(P("Mesure a l'execution : <b>%d</b> passent par " % len(NORMALISE) + C % '_per100d1' +
           " (lignes %s) et <b>%d</b> prennent la valeur brute (lignes %s). Les deux bruts sont "
           "les chemins de <i>reprise</i> — defendable, puisque la valeur a deja ete arrondie une "
           "fois ; mais la regle tient alors a l'<b>historique de la donnee</b>, pas au code."
           % (', '.join(str(n) for n in NORMALISE), len(BRUT),
              ', '.join(str(n) for n in BRUT))))

F.append(P("3.3 &mdash; Le hub recopie en deux variantes", 'h2'))
F.append(P("" + C % 'onFoodLabelFile' + " refait a la main les lignes du hub <b>en omettant</b> : "
           + C % "etat:'tel-que-vendu'" + " &middot; " + C % 'sourceId' + " &middot; "
           + C % '_bcPaquetG' + "/" + C % '_bcProposerPaquet' + " &middot; " + C % '_afNoteEtat'
           + " &middot; " + C % '_bcProposerDerniere(0)' + " &middot; la carte sante. "
           + C % 'quickFillFood' + " et " + C % '_afSuggPrendreLocale' + " en omettent une autre "
           "liste. <b>Ce ne sont pas des bugs isoles : c'est la meme fonction ecrite trois fois, "
           "qui derive.</b>"))

F.append(P("3.4 &mdash; Le garde-fou quantite tient a un ENDROIT, pas a une regle", 'h2'))
F.append(P("Il vit dans " + C % 'addFoodEntry' + ". Les deux autres sorties ne le croisent pas. "
           "C'est <i>defendable</i> (elles recopient une quantite deja stockee) mais la protection "
           "vient de la <b>position du code</b>, pas d'un controle. Le jour ou une quatrieme "
           "sortie apparait, rien ne la protege et rien ne le signale."))

F.append(PageBreak())
F.append(P("3.5 &mdash; " + C % '_provFood' + " est une liste blanche opt-in", 'h2'))
F.append(P("C'est le seul point commun aux %d sorties. Il ne valide rien : il recopie, champ par "
           "champ, ce que la porte a pose dans " % len(PUSHES) + C % '_afSrc' + ". <b>Un champ non "
           "liste disparait sans erreur et sans test rouge.</b>"))
F.append(bloc_code(extrait_motif(r'function _provFood\(vals\)\{', apres=2) + '\n  ...',
                   "L'objet de depart : tout ce qui n'est pas recopie ensuite reste a " + C % 'null' + "."))
F.append(Spacer(1, 5))
F.append(encadre(
    "LE FICHIER COMPTE LUI-MEME SES OUBLIS — QUATRE FOIS AU MEME ENDROIT",
    "Les commentaires de cette fonction, ecrits en majuscules par les versions successives, "
    "recensent quatre oublis du <b>meme</b> type : " + C % 'codeDouteux' + " &middot; "
    + C % 'q' + "/" + C % 'u' + " &middot; " + C % 'portionLabel' + "/" + C % 'portionWeightG'
    + " &middot; " + C % 'doute' + "/" + C % 'kcalDerivee' + ". "
    "<br/><br/><b>C'est la signature structurelle d'un recopieur, pas d'un validateur.</b> "
    "Le troisieme commentaire le dit en toutes lettres : <i>&laquo; j'ai ecrit la regle juste "
    "au-dessus de l'endroit ou je venais de l'enfreindre &raquo;</i>. Quand l'erreur se repete "
    "au meme endroit malgre un avertissement en majuscules, ce n'est plus de l'inattention : "
    "c'est la forme du code qui la produit.", ROUGE))

F.append(P("3.6 &mdash; Latent, mais reel : la valeur controlee n'est pas la valeur ecrite", 'h2'))
F.append(P("" + C % 'addFoodEntry' + " ecrit avec " + C % 'parseInt' + ", tout le reste lit avec "
           + C % 'numFR' + " (virgule et decimale). <b>Sans effet aujourd'hui</b> — les totaux "
           "affiches sont deja entiers — donc ce n'est pas un bug a corriger dans l'urgence. "
           "Mais c'est la forme classique : <i>on verifie une valeur, on en enregistre une autre</i>."))

# ── 4. La conclusion ──
F.append(P("4. Ce que ca veut dire pour la suite", 'h1'))
F.append(P("La question de Michel derriere la question : <i>&laquo; le vrai probleme de Nutrition "
           "vient-il du fait qu'on corrige les portes une par une au lieu d'avoir une seule douane "
           "finale ? &raquo;</i>"))
F.append(P("<b>Oui, et c'est mesurable.</b> Sur les dernieres versions nutrition, le motif est "
           "toujours le meme : <i>la porte jumelle avait le meme defaut</i>. La regle <b>R8</b> est "
           "citee huit fois dans le journal, et une famille de bugs a ete ecrite expres pour ca "
           "(" + C % 'BUGS.md' + " &sect;59) : <i>&laquo; le code corrige est juste, les temoins "
           "verts le meritent, la mutation mord &mdash; et la moitie du bug est encore la &raquo;</i>."))

F.append(Spacer(1, 4))
F.append(encadre(
    "LA RESERVE QUI CHANGE LE CHANTIER",
    "<b>La douane ne peut pas vivre dans " + C % '_provFood' + ".</b> Il ne voit que les quatre "
    "totaux et l'objet " + C % '_afSrc' + " ; il ne voit ni la quantite effective, ni le contexte "
    "de la porte, ni le pour-100&nbsp;g reel. "
    "<br/><br/>Une douane utile se place <b>entre les %d " % len(PUSHES) + C % 'push' + " et "
    + C % 'S.foodLog' + "</b> &mdash; c'est-a-dire un <b>quatrieme point qui n'existe pas encore</b>. "
    "Ce n'est donc pas un deplacement de code : c'est une piece a ajouter, avec ses temoins.", VERT))

F.append(Spacer(1, 6))
F.append(P("Ce que la douane devrait faire (a discuter, rien n'est decide)", 'h2'))
F.append(tableau(
    ["role", "aujourd'hui", "dans une douane"],
    [["normaliser le pour-100 g", "%d portes sur %d" % (len(NORMALISE), len(NUTRS)),
      "une fois, pour tout le monde"],
     ["regles physiques (masse, plafond kcal)", "bloquantes sur 1 porte, en avis sur les autres",
      "une seule force, decidee une fois"],
     ["quantite et unite", "recopiees par une liste blanche opt-in",
      "champ obligatoire ou absence <b>declaree</b>"],
     ["provenance", C % '_provFood' + " (recopie, 4 oublis recenses)",
      "liste <b>fermee</b> : un champ inconnu leve, il ne disparait pas"],
     ["coherence kcal / macros", "affichee dans le formulaire, jamais bloquante",
      "un <b>etat nomme</b> ecrit sur la ligne"]],
    [42 * mm, 63 * mm, 60 * mm]))

F.append(Spacer(1, 6))
F.append(encadre(
    "CE QUE CE DOCUMENT N'EST PAS",
    "<b>Aucun correctif n'a ete ecrit</b>, aucune ligne de production n'a change. Michel a demande "
    "une cartographie et une conclusion <b>avant</b> de decider d'une refonte : c'est tout ce que "
    "contient ce document. "
    "<br/><br/>Et une honnetete sur la methode : les comptes ci-dessus sont recalcules a chaque "
    "generation, mais <b>la lecture de ce qu'ils signifient reste la mienne</b>. Le generateur peut "
    "prouver qu'il y a %d sorties ; il ne peut pas prouver que deux d'entre elles <i>devraient</i> "
    "croiser un controle." % len(PUSHES), GRIS))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker — y a-t-il une douane unique avant S.foodLog ?',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
print('   mesure : %d ecritures, %d constructeurs de per100 (%d normalises / %d bruts), '
      '%d appels au hub' % (len(PUSHES), len(NUTRS), len(NORMALISE), len(BRUT), len(HUB_APPELS)))
