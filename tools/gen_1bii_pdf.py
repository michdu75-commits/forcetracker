#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/SOUS-ETAPE-1BII.pdf — une sous-etape SUPPRIMEE, et la provenance reprise.

   Neuvieme document de la serie : ... -> DECOUPAGE-1B-3 -> SOUS-ETAPE-3I -> CELUI-CI.

⭐⭐ TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI.
   Le document affirme deux choses mesurables, et chacune a son garde : que 1b-iv n'avait
   RIEN a extraire (une seule copie), et que `origine`/`saisie` ne sont PAS entres dans le
   proprietaire de 1b-ii.

⚠️ CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji, entites nommees comprises.
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
                                KeepTogether, Preformatted, PageBreak)
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'SOUS-ETAPE-1BII.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
SONDE = open(os.path.join(ROOT, 'tools', 'instantane_1b23.js'), encoding='utf-8').read()
SETUP = open(os.path.join(ROOT, 'setup.js'), encoding='utf-8').read()
DEC = open(os.path.join(ROOT, 'docs', 'SOUS-ETAPES-1B-3.md'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = '(ft-v\d+)'", SW) or [None, '?'])[1]

# Mesure du 12/09 : instantane identique avant/apres l'extraction 1b-ii.
SHA_INSTANTANE = '7a52c37da93e17a3'


def _commentaire(l):
    x = l.strip()
    return x.startswith('*') or x.startswith('//') or x.startswith('/*') or x.startswith('`')


LA = [l for l in APP.split('\n') if not _commentaire(l)]


def corps(nom):
    m = re.search(r'^function ' + nom + r'\(.*?^\}', APP, re.M | re.S)
    return m.group(0) if m else ''


# ── LES DECOMPTES, REFAITS ICI ───────────────────────────────────────────────
PROV_APPELS = len(re.findall(r'_srcProvenance\(', APP))
PROV_CORPS = (re.search(r'function _srcProvenance\(src\)\{[\s\S]*?\n\}', APP) or [''])
PROV_CORPS = PROV_CORPS.group(0) if hasattr(PROV_CORPS, 'group') else ''
SONDES = len(set(re.findall(r"out\['([^']+)'\]\s*=", SONDE)))
CLES_1BII = [k for k in set(re.findall(r"out\['([^']+)'\]\s*=", SONDE)) if k.startswith('1bii_')]

# 1b-iv : la sous-etape ecartee. Une extraction exige >= 2 copies ; on compte.
NUTRI_COL = len(re.findall(r'NUTRI_COLONNES', SETUP))
CSV_PARTAGE = len(re.findall(r'_csvFichier\(', SETUP))

# Les trois formulations divergentes d'`origine`, comptees dans le code servi.
ORIG_REPRISE = "origine:it.origine||'reprise'" in APP.replace(' ', '')
ORIG_UTILISATEUR = "origine:e.origine||'utilisateur'" in APP.replace(' ', '')
ORIG_DUR = "origine:'reprise'" in APP.replace(' ', '')

# ⭐ LE NOMBRE DE SOUS-ETAPES QUI RESTENT SE RECOMPTE, il ne se retape pas : la premiere
#    version de ce document disait « 7 restantes » alors que 1b-ii venait d'etre livree, et
#    c'est exactement le genre de chiffre qui se perime en silence d'une version a l'autre.
_TITRES = re.findall(r'^### (1b-[iv]+|3-[iv]+)\b(.*)$', DEC, re.M)
TOTAL_SE = len(_TITRES)
LIVREES = len([t for t in _TITRES if 'LIVR' in t[1].upper()])
ECARTEES = len([t for t in _TITRES if 'CART' in t[1].upper()])
RESTANTES = TOTAL_SE - LIVREES - ECARTEES

# ⛔ CHAQUE GARDE PROTEGE UNE AFFIRMATION DU DOCUMENT.
if PROV_APPELS != 4:
    raise SystemExit('`_srcProvenance` a %d occurrences, pas 4 (1 declaration + 3 appelants). '
                     'Le §3 repose dessus.' % PROV_APPELS)
if not PROV_CORPS:
    raise SystemExit('`_srcProvenance` est introuvable : tout le §3 est perime.')
if 'origine' in PROV_CORPS or 'saisie' in PROV_CORPS:
    raise SystemExit('PERIMETRE ROMPU : `origine` ou `saisie` est ENTRE dans le proprietaire. '
                     'Le §4 affirme exactement le contraire, et ce serait une decision produit.')
if SONDES != 15:
    raise SystemExit('L\'instantane porte %d cles distinctes, pas 15 — le §5 cite ce chiffre.'
                     % SONDES)
if len(CLES_1BII) != 3:
    raise SystemExit('%d sondes `1bii_` au lieu de 3 : les trois portes ne sont plus conduites.'
                     % len(CLES_1BII))
if NUTRI_COL != 2:
    raise SystemExit('`NUTRI_COLONNES` apparait %d fois dans setup.js, pas 2 (la declaration + '
                     'son unique usage). Tout le §2 repose sur « une seule copie ».' % NUTRI_COL)
if CSV_PARTAGE != 3:
    raise SystemExit('`_csvFichier` apparait %d fois, pas 3 (declaration + 2 appels) : le §2 '
                     'affirme que le partage etait DEJA fait au bon niveau.' % CSV_PARTAGE)
if TOTAL_SE != 10:
    raise SystemExit('Le decoupage porte %d sous-etapes, pas 10 — le §1 cite ce chiffre.' % TOTAL_SE)
if ECARTEES != 1:
    raise SystemExit('%d sous-etape(s) ecartee(s), pas 1 : tout le §2 parle d\'un cas unique.'
                     % ECARTEES)
if not (ORIG_REPRISE and ORIG_UTILISATEUR and ORIG_DUR):
    raise SystemExit('Les trois formulations divergentes d\'`origine` ne sont plus toutes la : '
                     'une harmonisation a eu lieu, ce que le §4 dit ne PAS avoir fait.')







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
                         fontSize=13, leading=16, textColor=ROUGE, spaceBefore=14, spaceAfter=6),
    'h2': ParagraphStyle('h2', parent=S['Heading2'], fontName='Helvetica-Bold',
                         fontSize=10.5, leading=13.5, textColor=ENCRE, spaceBefore=9, spaceAfter=4),
    'p': ParagraphStyle('p', parent=S['Normal'], fontName='Helvetica',
                        fontSize=9.3, leading=13.2, textColor=ENCRE, spaceAfter=6),
    'petit': ParagraphStyle('petit', parent=S['Normal'], fontName='Helvetica',
                            fontSize=8.2, leading=11.5, textColor=GRIS, spaceAfter=5),
    'cell': ParagraphStyle('cell', parent=S['Normal'], fontName='Helvetica',
                           fontSize=8.1, leading=10.6),
    'cellb': ParagraphStyle('cellb', parent=S['Normal'], fontName='Helvetica-Bold',
                            fontSize=8.1, leading=10.6),
    'code': ParagraphStyle('code', parent=S['Normal'], fontName='Courier',
                           fontSize=7.0, leading=8.8, textColor=ENCRE),
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
                    raise SystemExit('ENTITE NOMMEE NON RENDUE %s (%s) dans %s'
                                     % (m.group(0), hex(ord(ch)), ou))
    return x


C = "<font face='Courier'>%s</font>"


def P(t, s='p'):
    return Paragraph(_v(t, 'paragraphe'), st[s])


def encadre(titre, corps_, couleur=ROUGE):
    t = Table([[Paragraph('<b>%s</b>' % _v(titre, 'titre'), st['cellb'])],
               [Paragraph(_v(corps_, 'corps'), st['cell'])]], colWidths=[165 * mm])
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


_LARG = 165 * mm - 12


def bloc_code(txt, legende=None):
    _v(txt, 'bloc de code')
    for l in txt.split('\n'):
        if stringWidth(l, 'Courier', 7.0) > _LARG:
            raise SystemExit('LIGNE QUI DEBORDE (%d car) : %s' % (len(l), l[:70]))
    t = Table([[Preformatted(txt, st['code'])]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FONDC),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.0, TRAIT), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    if legende:
        return KeepTogether([Paragraph(_v(legende, 'legende'), st['petit']), t])
    return t


def pied(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(GRIS)
    canvas.drawString(22 * mm, 12 * mm,
                      'Force Tracker — une sous-etape supprimee, et la provenance reprise (%s) — 12/09/2026'
                      % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()




AVANT = """// AVANT — le meme triplet, ecrit a l'identique par deux portes

// quickFillFood (« Mes aliments »)
_afSetSrc({saisie:'liste', origine:it.origine||'reprise',
  sourceId:it.sourceId||null, etat:it.etat||null, per100:it.per100||null,
  attendu:...});

// _afSuggPrendreLocale (la recherche dans le journal)
_afSetSrc({saisie:'historique', origine:e.origine||'utilisateur',
  sourceId:e.sourceId||null, etat:e.etat||null, per100:e.per100||null,
  attendu:...});"""

APRES = """// APRES — un proprietaire pour ce qui est IDENTIQUE ;
//         ce qui DIVERGE reste visible chez l'appelant

function _srcProvenance(src){
  const s = src || {};
  return { sourceId: s.sourceId || null, etat: s.etat || null, per100: s.per100 || null };
}

_afSetSrc(Object.assign({saisie:'liste', origine:it.origine||'reprise'},
                        _srcProvenance(it), {attendu:...}));

_afSetSrc(Object.assign({saisie:'historique', origine:e.origine||'utilisateur'},
                        _srcProvenance(e), {attendu:...}));"""

CSV = """// 1b-iv — CE QUE LE PLAN ANNONCAIT COMME « la moins risquee du lot »

const NUTRI_COLONNES = ['date','repas','aliment','quantite','unite', ... ];
async function exportNutritionCsv(){
  const L = (S.foodLog||[]).slice().sort(...).map(e => ({ ...13 champs... }));
  await _csvFichier(NUTRI_COLONNES, L, 'nutrition', 'lignes');
}

// Mesure : cette forme existe UNE SEULE FOIS. Aucun import ne la relit.
// Et _csvFichier(colonnes, lignes, ...) est DEJA le proprietaire commun :
// il sert l'export nutrition ET l'export poids."""

SONDE_MORTE = """// LA SONDE QUE J'AI ECRITE D'ABORD — ET QUI NE CONDUISAIT RIEN

S.foodLog = [ ...le cas a mesurer... ];
_afSuggPrendreLocale(0);            // <- on croit conduire la porte
// resultat mesure : ABSENT, ABSENT, ABSENT... sur les trois cas.

// Cause : elle lit `_afSuggLoc[i]`, PAS `S.foodLog`.
function _afSuggPrendreLocale(i){
  const e = _afSuggLoc[i]; if(!e) return;     // <- elle SORTAIT ici
  ...
}

// Corrige : on remplit par la VRAIE fonction de production.
_afSuggLoc = _afSuggLocales(cs.name);
if(!_afSuggLoc.length) throw new Error('liste locale VIDE');"""


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P('Une sous-etape supprimee, et la provenance reprise', 'titre'))
F.append(P("Force Tracker &mdash; 12/09/2026, " + C % VERSION + ". Neuvieme document de la serie. "
           "Michel : <i>&laquo; continue selon le decoupage, une sous-etape a la fois &raquo;</i>. "
           "Deux choses se sont passees : la sous-etape suivante s'est revelee <b>vide</b>, et la "
           "suivante encore a ete livree.", 'sous'))

F.append(encadre(
    "LE FAIT PRINCIPAL DE CETTE SESSION",
    "<b>La sous-etape que j'allais prendre n'avait rien a extraire</b> &mdash; mesure avant la "
    "moindre ligne de code. Et l'erreur qui l'avait fait entrer dans le plan vaut plus que la "
    "sous-etape elle-meme : <b>j'avais verse au decoupage tout ce qu'un compteur defaillant avait "
    "rate, sans jamais demander, site par site, s'il etait DUPLIQUE.</b>"
    "<br/><br/><i>Reparer l'instrument et refaire l'inventaire sont deux gestes differents. "
    "J'avais fait le premier en croyant avoir fait le second.</i>"))

# ── 1 ──
F.append(P("1. Le test d'entree qui manquait", 'h1'))
F.append(P("Le decoupage de 1b et 3 comptait <b>10 sous-etapes</b>. Chacune etait decrite par son "
           "perimetre, ses sites, son instantane, ses mutations et son rollback &mdash; mais "
           "<b>aucune ne disait combien de COPIES elle supprimait</b>. C'est pourtant la seule "
           "question qui decide si une extraction a un sens.", 'p'))
F.append(encadre(
    "UNE EXTRACTION EXIGE AU MOINS DEUX COPIES",
    "Sortir un proprietaire qui n'a qu'<b>un seul appelant</b> n'est pas du rangement : c'est de "
    "la complexite ajoutee sans contrepartie, et une regle du depot l'interdit explicitement "
    "(<i>la gouvernance sert le produit, jamais l'inverse</i>)."
    "<br/><br/>Le test est desormais ecrit dans le document : <b>compter les copies AVANT de "
    "decrire la sous-etape</b>.", ORANGE))

# ── 2 ──
F.append(P("2. 1b-iv (l'export CSV) : ecartee, et elle reste ecrite", 'h1'))
F.append(bloc_code(CSV))
F.append(tableau(
    ["ce que le plan annoncait", "ce que la MESURE dit"],
    [["&laquo; la ligne CSV du journal nutrition, 13 colonnes aux noms francais &raquo;, decrite "
      "comme <b>la sous-etape la moins risquee du lot</b>",
      "la forme existe <b>une seule fois</b> dans tout le code servi ("
      + C % 'NUTRI_COLONNES' + " : %d occurrences, la declaration et son unique usage). "
      "Aucun import ne la relit." % NUTRI_COL],
     ["&laquo; prerequis absolu : <b>AUCUNE sonde</b> aujourd'hui &raquo;",
      "faux aussi : un temoin conduit <b>vraiment</b> " + C % 'exportNutritionCsv()' + ", "
      "intercepte la remise du fichier et <b>lit le CSV produit</b> (echappement de la virgule, "
      "BOM, provenance, ordre)"],
     ["&mdash;",
      "et le partage etait <b>DEJA fait au bon niveau</b> : " + C % '_csvFichier(...)'
      + " est le proprietaire commun, appele par l'export nutrition <b>et</b> l'export poids "
      "(%d occurrences)" % CSV_PARTAGE]],
    [78 * mm, 87 * mm]))
F.append(P("=&gt; <b><i>L'etiquette &laquo; instantane &raquo; etait fausse DES DEUX COTES &mdash; "
           "et c'est le miroir exact de la version precedente</i></b>, ou elle annoncait "
           "&laquo; couvert &raquo; pour une sonde qui ne couvrait rien. <b>Dans les deux sens, "
           "l'etiquette ne remplace pas l'ouverture du fichier.</b>", 'p'))
F.append(encadre(
    "ELLE N'EST PAS EFFACEE DU PLAN, ELLE Y RESTE AVEC SA RAISON",
    "Une sous-etape <b>supprimee</b> ne laisse qu'un trou dans une liste &mdash; c'est-a-dire "
    "exactement a quoi ressemble un oubli. Quelqu'un la remettrait dans six mois."
    "<br/><br/>Elle reste donc ecrite <b>a sa place dans l'ordre</b>, marquee ECARTEE, "
    "<b>avec la mesure qui l'a tuee</b>. "
    "<i>C'est la meme regle qui veut qu'un retrait volontaire s'ecrive comme un ajout.</i>"))
F.append(P(("<b>Les %d autres sous-etapes ont ete auditees au meme test, et toutes tiennent</b> : "
            % (TOTAL_SE - 2)) +
           "1b-ii (3-4 sites) &middot; 1b-iii (2) &middot; 1b-v (2, identiques au caractere pres) "
           "&middot; 3-ii/iii/iv/v (les 5 sites &laquo; grammes seuls &raquo;). " +
           ("<b>Une seule etait vide sur %d.</b>" % TOTAL_SE), 'p'))

F.append(PageBreak())

# ── 3 ──
F.append(P("3. 1b-ii : la provenance reprise", 'h1'))
F.append(P("Trois champs &mdash; " + C % 'sourceId' + ", " + C % 'etat' + ", " + C % 'per100'
           + " &mdash; recopies depuis une ligne deja enregistree, a l'identique par deux portes. "
           "Une troisieme (" + C % 'quickAddFood' + ") n'en porte que la paire : son "
           + C % 'per100' + " lui vient du proprietaire de la sous-etape precedente.", 'p'))
F.append(bloc_code(AVANT))
F.append(bloc_code(APRES))

# ── 4 ──
F.append(P("4. La coupe est dictee par les DIVERGENCES, pas par la ressemblance", 'h1'))
F.append(encadre(
    "ON EXTRAIT CE QUI EST IDENTIQUE, ON LAISSE VISIBLE CE QUI DIVERGE",
    "Il etait tentant de faire entrer " + C % 'origine' + " et " + C % 'saisie' + " dans le "
    "proprietaire : ils sont sur la meme ligne, ils ressemblent au reste. <b>Mesure : ils ne "
    "disent pas la meme chose aux trois portes.</b>"
    "<br/><br/>Les unifier changerait <b>ce que le journal dit de lui-meme</b> &mdash; donc ce "
    "n'est pas une extraction, c'est une <b>decision produit</b>, et elle revient a Michel. "
    "<i>Un ecart qu'on lit dans le code ne se perd pas ; un ecart absorbe dans un proprietaire, si.</i>"))
F.append(tableau(
    ["porte", C % 'origine', C % 'saisie', "ce que ca veut dire"],
    [["&laquo; Mes aliments &raquo;", C % "it.origine||'reprise'", C % "'liste'",
      "elle <b>herite</b> de la source si la ligne en avait une"],
     ["recherche du journal", C % "e.origine||'utilisateur'", C % "'historique'",
      "meme mecanique, <b>mais un autre repli</b> et un autre mot"],
     ["ajout direct", C % "'reprise'" + " (en dur)", C % "'liste'",
      "<b>elle ignore la source EXPRES</b> &mdash; voir ci-dessous"]],
    [34 * mm, 42 * mm, 26 * mm, 63 * mm]))
F.append(P("=&gt; <b><i>Trois formulations, et au moins une est un choix assume.</i></b> "
           "Mesure a la sonde : une ligne venue d'un code-barres (" + C % "origine:'off'"
           + ") se reenregistre par la porte directe en " + C % "'reprise'" + ". "
           "<b>Ce n'est pas un bug</b> : la source n'est pas conservee sur les favoris, donc en "
           "heriter ferait <b>affirmer une provenance qu'on n'a pas relue</b>. "
           "<i>La provenance ne ment pas.</i>", 'p'))
F.append(P("Un temoin de perimetre lit le <b>corps</b> du proprietaire et exige que ni "
           + C % 'origine' + " ni " + C % 'saisie' + " n'y figurent. Un garde de ce document "
           "refuse de le produire si c'etait le cas.", 'p'))

# ── 5 ──
F.append(P("5. La sonde etait morte, et je l'ai vu AVANT de capturer", 'h1'))
F.append(bloc_code(SONDE_MORTE))
F.append(encadre(
    "POURQUOI C'EST LE MOMENT QUI COMPTE, PAS L'ERREUR",
    "Le critere de reussite est <b>binaire</b> : l'instantane doit etre identique octet pour octet "
    "avant et apres. Une sonde qui ne conduit rien reste <b>identique quoi qu'on fasse au code</b> "
    "&mdash; elle aurait donc <b>valide n'importe quelle extraction</b>, y compris une fausse."
    "<br/><br/>=&gt; <b>Un BEFORE capture avec une sonde morte est pire qu'aucun BEFORE</b>, parce "
    "qu'il produit une preuve. Le garde qui l'a attrape est trivial et vaut d'etre garde : <i>la "
    "sonde LEVE si la liste qu'elle est censee conduire est vide.</i>"))

# ── 6 ──
F.append(P("6. Les mesures", 'h1'))
F.append(tableau(
    ["preuve", "resultat"],
    [["Instantane (%d cles), avant / apres" % SONDES,
      "<b>identique octet pour octet</b>, sha256 " + C % SHA_INSTANTANE],
     ["Controle negatif", "<b>10 mutations, TOUTES mordent</b> &mdash; et le <b>controle sain</b> "
      "d'abord, a 0 rouge sur 15"],
     ["Temoins", "bloc <b>CCXCIV</b>, 15 temoins, dont <b>2 de perimetre</b>"],
     ["Source : le proprietaire est unique",
      "%d occurrences (1 declaration + 3 appelants)" % PROV_APPELS],
     ["Source : les 3 divergences sont intactes",
      "les trois formulations d'" + C % 'origine' + " sont <b>toujours la</b>"]],
    [56 * mm, 109 * mm]))
F.append(encadre(
    "LES DEUX MUTATIONS QUI COMPTENT LE PLUS",
    "<b>(1) L'harmonisation interdite</b> &mdash; faire heriter la porte directe de "
    + C % 'it.origine' + " : <b>1 rouge, exactement le temoin qui protege ce choix</b>."
    "<br/><b>(2) Le debordement</b> &mdash; absorber " + C % 'origine' + " ou " + C % 'saisie'
    + " dans le proprietaire : <b>5 et 4 rouges</b>, dont les deux temoins de perimetre."
    "<br/><br/><i>Une mutation qui ne mord nulle part designe un temoin manquant, pas du code "
    "inutile. Ici, les deux frontieres que Michel a posees sont tenues par des temoins qui "
    "rougissent.</i>", VERT))

# ── 7 ──
F.append(P("7. Ce qui reste", 'h1'))
F.append(tableau(
    ["sujet", "etat"],
    [["Les %d sous-etapes restantes" % RESTANTES,
      "auditees et reelles. /!\\ Le test d'entree (<b>compter les copies</b>) leur a ete applique "
      "&mdash; il ne l'avait pas ete a l'ecriture du plan"],
     ["Les 4 harmonisations",
      "<b>decisions produit</b>, elles attendent Michel. Critere : est-ce que ca modifie ce qui "
      "est ECRIT dans le journal alimentaire ?"],
     ["Le hub et la douane", "apres 1b et 3, consigne explicite inchangee"],
     ["Les favoris perdus entre onglets, l'ecart 48,3 / 48", "ouverts, non corriges"],
     ["L'historique, les migrations", "non touches"]],
    [52 * mm, 113 * mm]))

F.append(Spacer(1, 8))
F.append(P("Document genere depuis le code servi &mdash; tous les decomptes cites sont recomptes a "
           "chaque generation (%d occurrences du proprietaire, %d cles de sonde dont %d pour les "
           "trois portes, %d occurrences de la liste de colonnes CSV, %d de son proprietaire "
           "commun). <b>Neuf gardes refusent de produire si un fait tombe</b> &mdash; dont un qui "
           "verifie que " % (PROV_APPELS, SONDES, len(CLES_1BII), NUTRI_COL, CSV_PARTAGE)
           + C % 'origine' + "/" + C % 'saisie' + " ne sont <b>pas</b> entres dans le proprietaire, "
           "et un qui verifie que les <b>trois</b> formulations divergentes sont toujours la. "
           "Source : " + C % 'tools/gen_1bii_pdf.py' + ".", 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=23 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker - une sous-etape supprimee, et la provenance reprise',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK -> %s (%d Ko)' % (OUT, os.path.getsize(OUT) // 1024))
