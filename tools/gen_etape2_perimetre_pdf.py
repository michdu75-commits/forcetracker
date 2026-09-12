#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/ETAPE2-ET-PERIMETRE-MESURE.pdf — l'etape 2 livree, et pourquoi 1b et 3 ne le sont pas.

   Sixieme document de la serie : DOUANE -> ARCHI -> PLAN -> PHASE0A-ETAPE1A -> VALIDATION-IPHONE
   -> CELUI-CI. Michel a valide la phase 0a sur iPhone et donne le feu vert pour 1b, 2 et 3, avec
   une consigne qui decide de tout : « si une divergence reelle apparait, mesure-la et ARRETE-TOI
   avant de la corriger au passage ». La divergence est apparue AVANT la premiere ligne de code,
   et elle porte sur le PERIMETRE ECRIT DANS LE PLAN.

⭐ LES CHIFFRES DE CE DOCUMENT SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI.
   Un document qui cite un decompte et ne le verifie pas refait exactement l'erreur qu'il raconte.
   Chaque garde protege une affirmation : si le fait tombe, le generateur refuse de produire.

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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'ETAPE2-ET-PERIMETRE-MESURE.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SET = open(os.path.join(ROOT, 'setup.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()


def _commentaire(l):
    x = l.strip()
    return x.startswith('*') or x.startswith('//') or x.startswith('/*') or x.startswith('`')


def _code(src):
    return [l for l in src.split('\n') if not _commentaire(l)]


LA, LS = _code(APP), _code(SET)

VERSION = (re.search(r"const CACHE = '(ft-v\d+)'", SW) or [None, '?'])[1]

# ── LES DECOMPTES, REFAITS ICI (jamais recopies du texte) ─────────────────────
PROPRIO = len([l for l in LA if re.search(r'\{kcal:_per100d1\(', l)])
APPELS = len(re.findall(r'_per100Derive\(', APP))
VERIF = len(re.findall(r'_per100SuitLaPortion\(', APP))
TOLERANCE = '<=0.6' in APP
RE_G = re.compile(r"q>0\s*&&\s*\(!\w+\.u\s*\|\|\s*\w+\.u==='g'\)")
RE_P = re.compile(r"u==='g'\s*\|\|\s*\w+\.u==='portion'")
REGLE_G = len([l for l in LA if RE_G.search(l)])
REGLE_P = len([l for l in LA if RE_P.search(l)])
MOITIE_PORTION = len([l for l in LA if re.search(r"\.u==='portion'", l)])
FORME_ALIMENT = len([l for l in LA if 'portionWeightG' in l]) + \
                len([l for l in LS if 'portionWeightG' in l])
ECRIVAINS = len(re.findall(r'foodLog\.push\(', APP))
_M = re.search(r'const _e=Object\.assign\(\{[^\n]*', APP)
LIGNE_ADD = _M.group(0) if _M else ''
RACCOURCI = bool(_M) and 'kcal:' not in LIGNE_ADD and ',kcal,' in LIGNE_ADD
_NC = re.search(r'const NUTRI_COLONNES = \[[^\]]*\]', SET)
COLONNES = len(re.findall(r"'", _NC.group(0))) // 2 if _NC else 0

# ⛔ CHAQUE GARDE PROTEGE UNE AFFIRMATION DU DOCUMENT.
if APPELS != 4:
    raise SystemExit('`_per100Derive` a %d occurrences, pas 4 (1 declaration + 3 appelants). '
                     'Tout le §2 repose sur ce chiffre.' % APPELS)
if PROPRIO != 1:
    raise SystemExit('La formule `{kcal:_per100d1(...)}` existe %d fois dans le CODE, pas 1. '
                     'Le document affirme un proprietaire UNIQUE — il ne l\'est plus.' % PROPRIO)
if VERIF != 2 or not TOLERANCE:
    raise SystemExit('`_per100SuitLaPortion` n\'est plus intacte (%d occurrences, tolerance %s). '
                     'Le §3 explique justement pourquoi elle est LAISSEE DEHORS.' % (VERIF, TOLERANCE))
if (REGLE_G, REGLE_P) != (5, 2):
    raise SystemExit('La regle « quantite utilisable ? » compte %d+%d ecritures, pas 5+2. '
                     'Le tableau du §4 est faux.' % (REGLE_G, REGLE_P))
if MOITIE_PORTION != 9:
    raise SystemExit('La moitie PORTIONS compte %d lignes, pas 9 — le chiffre cle du §4 est faux.'
                     % MOITIE_PORTION)
if not RACCOURCI:
    raise SystemExit('`addFoodEntry` N\'EST PLUS en raccourci ES6 — or c\'est LA demonstration '
                     'du §5 (un motif `kcal:` ne peut pas la voir). La famille §63 tombe.')
if ECRIVAINS != 3:
    raise SystemExit('Il y a %d ecrivains de `S.foodLog`, pas 3 — le §5 les cite.' % ECRIVAINS)
if COLONNES != 13:
    raise SystemExit('`NUTRI_COLONNES` porte %d colonnes, pas 13 — chiffre cite au §5.' % COLONNES)

# ⚠️ Extraits COPIES du code servi, pas retapes.
AVANT = """// AVANT — la meme algebre, retapee a trois endroits

// _provFood, branche GRAMMES                          // _provFood, branche PORTIONS
const f=100/q;                                         const f=100/masse;
p.per100={kcal:_per100d1((+vals.kcal||0)*f),           p.per100={kcal:_per100d1((+vals.kcal||0)*f),
          prot:_per100d1((+vals.prot||0)*f),                     prot:_per100d1((+vals.prot||0)*f),
          carbs:_per100d1((+vals.carbs||0)*f),                   carbs:_per100d1((+vals.carbs||0)*f),
          fat:_per100d1((+vals.fat||0)*f)};                      fat:_per100d1((+vals.fat||0)*f)};

// saveEditFood
const f=100/masse;
e.per100={kcal:_per100d1((+e.kcal||0)*f), prot:_per100d1((+e.prot||0)*f),
          carbs:_per100d1((+e.carbs||0)*f), fat:_per100d1((+e.fat||0)*f)};"""

APRES = """// APRES — un seul proprietaire, et il sait DIRE QU'IL NE SAIT PAS

function _per100Derive(vals, masse){
  const m=+masse||0;
  if(!(m>0)) return null;          // <- ce null EFFACE un pour-100 g orphelin (R29)
  const f=100/m;
  return {kcal:_per100d1((+vals.kcal||0)*f), prot:_per100d1((+vals.prot||0)*f),
          carbs:_per100d1((+vals.carbs||0)*f), fat:_per100d1((+vals.fat||0)*f)};
}

// les 3 appelants
p.per100=_per100Derive(vals, q);                                       // grammes
if(!p.per100){ const d=_per100Derive(vals, masse); if(d) p.per100=d; } // portions
const d=_per100Derive(e, (+e.q||0)*(+e.portionWeightG||0));            // edition
if(d) e.per100=d; else if(e.per100) delete e.per100;"""

DEHORS = """// LAISSEE DEHORS, EXPRES — meme algebre, autre metier

function _per100SuitLaPortion(av){          // elle VERIFIE : « ce pour-100 g
  if(!av.per100) return true;               //   venait-il d'une portion ? »
  const m=(+av.q||0)*(+av.pw||0);           // ... et non « quelle est sa valeur ? »
  if(!(m>0)) return false;
  const f=100/m, ok=(a,b)=>Math.abs((+a||0)-(+b||0))<=0.6;   // <- sa tolerance
  return ok(av.per100.kcal,(+av.kcal||0)*f) && ...
}"""

AVEUGLE = """// POURQUOI LE COMPTEUR S'EST TROMPE — addFoodEntry, la porte la plus utilisee

const _e=Object.assign({date:_journalJourActif(), meal:_afMeal, name:name.slice(0,80),
                        kcal, prot, carbs, fat, ts:Date.now()},   // <- raccourci ES6
                       _provFood({kcal,prot,carbs,fat}));
S.foodLog.push(_e);

// Il n'y a PAS UN SEUL « kcal: » dans cette ligne.
// Un motif /kcal\\s*:/ ne la voit pas — et il ne signale rien, puisqu'il trouve les autres."""

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
                      'Force Tracker — etape 2 livree, perimetre de 1b et 3 mesure (%s) — 12/09/2026'
                      % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("Etape 2 livree, et pourquoi 1b et 3 ne le sont pas", 'titre'))
F.append(P("Force Tracker &mdash; 12/09/2026, " + C % VERSION + ". Sixieme document de la serie "
           "(DOUANE -&gt; ARCHI -&gt; PLAN -&gt; PHASE0A-ETAPE1A -&gt; VALIDATION-IPHONE -&gt; "
           "celui-ci). Michel a valide la phase 0a <b>sur iPhone</b> et donne le feu vert pour "
           "<b>1b, 2 et 3</b>, meme methode que 1a. <b>Une seule des trois est livree</b>, et c'est "
           "sa propre consigne qui l'a decide.", 'sous'))

F.append(encadre(
    "LA CONSIGNE QUI DECIDE DE CETTE VERSION",
    "<i>&laquo; Si une regression ou une divergence reelle apparait pendant l'extraction, "
    "<b>mesure-la et arrete-toi</b> avant de la &lsquo;corriger au passage&rsquo;. &raquo;</i>"
    "<br/><br/><b>La divergence est apparue AVANT la premiere ligne de code</b> &mdash; et elle ne "
    "porte pas sur le code, elle porte sur <b>le perimetre ecrit dans le plan</b>.", ORANGE))

# ── 1 ──
F.append(P("1. Le perimetre : ce que le plan annonce, ce que la mesure donne", 'h1'))
F.append(tableau(
    ["etape", "perimetre du plan", "perimetre MESURE", "fait ?"],
    [["<b>1b</b> &mdash; la &laquo; forme aliment &raquo;", "5 sites",
      "<b>%d lignes</b> portent le SEUL champ " % FORME_ALIMENT + C % 'portionWeightG' +
      " <i>(recompte ici)</i>. Le balayage donne <b>au moins 15</b> lecteurs/ecrivains de "
      "la forme aliment, en <b>3 ecritures differentes</b> <i>(mesure a la main, PAS "
      "recomptee par ce generateur)</i>", "<b>non</b>"],
     ["<b>2</b> &mdash; le pour-100 g derive", "3 sites",
      "<b>3</b> &mdash; <i>le seul juste</i>", "<b>livree</b>"],
     ["<b>3</b> &mdash; &laquo; quantite utilisable ? &raquo;", "6 sites",
      "<b>%d ecritures</b> en 2 formes (%d + %d), <b>+ %d lignes</b> de la moitie PORTIONS, "
      "jamais comptee" % (REGLE_G + REGLE_P, REGLE_G, REGLE_P, MOITIE_PORTION), "<b>non</b>"]],
    [38 * mm, 27 * mm, 78 * mm, 22 * mm]))

F.append(Spacer(1, 4))
F.append(P("<b>Et ce ne sont pas des ecarts de comptage : les DEFAUTS divergent d'un site a "
           "l'autre.</b> C'est ce qui interdit une extraction mecanique &mdash; choisir une valeur "
           "ne serait pas un rangement, ce serait une <b>decision</b> qui change des lignes deja "
           "enregistrees :"))
F.append(tableau(
    ["champ", "ce qu'on trouve selon le site"],
    [[C % 'q', "tantot <b>0</b>, tantot <b>null</b>"],
     [C % 'portionWeightG', "<b>0</b>, <b>null</b>, ou <b>la cle est absente</b>"],
     [C % 'origine', "<b>null</b>, " + C % "'utilisateur'" + ", ou " + C % "'reprise'"]],
    [45 * mm, 120 * mm]))
F.append(P("L'instantane " + C % 'tools/instantane_1b23.js' + " <b>fige ces trois ecarts expres</b> : "
           "il est ce qui empeche de les harmoniser &laquo; au passage &raquo; sans s'en apercevoir.",
           'petit'))

# ── 2 ──
F.append(PageBreak())
F.append(P("2. Ce qui est livre : un seul proprietaire du pour-100 g derive", 'h1'))
F.append(P("Trois endroits retapaient la meme algebre &mdash; " + C % 'totaux x 100 / masse' +
           ", macro par macro, arrondie a la decimale."))
F.append(bloc_code(AVANT))
F.append(Spacer(1, 4))
F.append(bloc_code(APRES))
F.append(Spacer(1, 4))
F.append(encadre(
    "LA DUPLICATION AVAIT DEJA COUTE, SUR CES LIGNES-LA",
    "En <b>ft-v1188</b>, le passage de " + C % 'Math.round' + " a " + C % '_per100d1' + " a du etre "
    "pose sur <b>deux</b> d'entre elles &mdash; apres l'avoir ete sur <b>7 autres portes</b> en "
    "ft-v1170. C'est la famille <b>&sect;59</b> du depot (<i>la porte jumelle</i>), a sa 8<super>e</super> "
    "occurrence."
    "<br/><br/><i>La question n'etait pas de savoir si la 3<super>e</super> copie serait oubliee, "
    "mais quand.</i>"))

# ── 3 ──
F.append(P("3. Le point de conception : ce qu'on factorise est l'INTENTION, pas la ressemblance", 'h1'))
F.append(P("A six lignes du nouveau proprietaire vit une fonction qui porte <b>exactement la meme "
           "algebre</b>. On est tente de l'absorber. <b>Elle est laissee dehors.</b>"))
F.append(bloc_code(DEHORS))
F.append(P("Elle <b>verifie</b> (&laquo; ce pour-100 g venait-il d'une portion ? &raquo;, a 0,6 pres), "
           "elle ne <b>derive</b> pas. La fondre dans le proprietaire changerait <b>son metier</b>, "
           "pas son code. Un temoin fige qu'elle est toujours la, avec sa tolerance."))
F.append(encadre(
    "ET LE PROPRIETAIRE SAIT DIRE QU'IL NE SAIT PAS",
    "Masse nulle, negative, illisible -&gt; il rend " + C % 'null' + ". <b>Ce " + C % 'null' +
    " n'est pas decoratif</b> : c'est lui qui, dans " + C % 'saveEditFood' + ", <b>EFFACE</b> un "
    "pour-100 g devenu orphelin quand la personne retire le poids de sa portion. <b>R29</b> &mdash; "
    "un " + C % 'null' + " ne se remplace jamais par un defaut.", VERT))

# ── 4 ──
F.append(PageBreak())
F.append(P("4. L'etape 3 en detail : le plan comptait la moitie de la question", 'h1'))
F.append(P("<b>Le &laquo; 6 &raquo; du plan etait presque juste sur la regle stricte</b> : elle est "
           "ecrite <b>%d fois</b>, en <b>2 formes</b>." % (REGLE_G + REGLE_P), 'h2'))
F.append(tableau(
    ["forme", "combien", "ce qu'elle accepte"],
    [[C % "+q&gt;0 &amp;&amp; (!u || u==='g')", "<b>%d</b>" % REGLE_G,
      "les grammes <b>seuls</b> (et l'unite absente)"],
     [C % "... || u==='portion'", "<b>%d</b>" % REGLE_P,
      "les grammes <b>et</b> les portions"]],
    [72 * mm, 20 * mm, 73 * mm]))
F.append(Spacer(1, 4))
F.append(encadre(
    "CE QUE LE PLAN A RATE : LA MOITIE PORTIONS",
    C % "u==='portion'" + " apparait <b>%d fois</b> de plus, sur des lignes qui decident elles aussi "
    "de ce qu'on fait de la quantite. <b>Elle a ete ajoutee en ft-v1183 / ft-v1186 et jamais "
    "reintegree a l'inventaire.</b>" % MOITIE_PORTION +
    "<br/><br/>Total reel : <b>%d decisions</b> sur l'unite, pas 6." % (REGLE_G + REGLE_P + MOITIE_PORTION)))

F.append(Spacer(1, 6))
F.append(encadre(
    "ET J'AI FAILLI LIVRER ICI LE MEME GENRE DE CHIFFRE QUE CELUI QUE JE REPROCHE AU PLAN",
    "Ma premiere redaction annoncait <i>&laquo; ~17 sites, au moins 3 ecritures de la regle &raquo;</i>, "
    "en citant " + C % '_provFood' + " @1232 contre @1311 comme <b>deux ecritures non equivalentes</b>."
    "<br/><br/><b>Relu ligne a ligne avant de pousser : c'est faux.</b> @1311 ne pose pas la meme "
    "question &mdash; elle interroge " + C % '_afRef' + " (l'etat de l'ecran), pas " + C % '_afSrc' +
    " (la provenance de l'aliment) &mdash; et son " + C % '===' + " strict y est <b>necessaire</b> : "
    + C % '_afRef.u' + " vaut " + C % "''" + " dans l'etat &laquo; portions &raquo;, donc un "
    + C % '!u' + " permissif ferait tomber une portion dans la branche grammes."
    "<br/><br/><b><i>Un chiffre rond se verifie ligne a ligne &mdash; surtout quand il sert a "
    "demontrer qu'un autre chiffre etait faux.</i></b>", ORANGE))

# ── 5 ──
F.append(PageBreak())
F.append(P("5. Pourquoi le compteur s'est trompe (nouvelle famille &sect;63)", 'h1'))
F.append(bloc_code(AVEUGLE))
F.append(P("<b>Meme cause pour l'export CSV</b> de " + C % 'setup.js' + " : <b>%d colonnes</b> aux "
           "noms <b>francais</b> (" % COLONNES + C % 'quantite, unite, portion_label...' +
           "), avec sa liste figee a part. Aucun motif pense pour le schema interne ne peut la voir."))
F.append(encadre(
    "LA FAMILLE, ECRITE DANS `BUGS.md` &sect;63",
    "<b><i>Un motif de recherche qui suppose une SYNTAXE ne compte pas les endroits : il compte "
    "les endroits ecrits comme on les imaginait.</i></b>"
    "<br/><br/><b>Pourquoi c'est couteux</b> : le chiffre sert ensuite a <b>dimensionner un "
    "chantier</b>. Une extraction &laquo; de 6 sites &raquo; qu'on decouvre a 16 en cours de route "
    "se termine de deux facons, toutes deux mauvaises &mdash; on livre a moitie, ou on <b>elargit "
    "en silence</b> un perimetre que personne n'a valide. <i>Un inventaire faux ne se manifeste "
    "pas comme une erreur : il se manifeste comme un chantier qui deborde.</i>"
    "<br/><br/><b>Ce qui l'attrape</b> : compter <b>deux fois, autrement</b> (par motif de texte "
    "<b>et</b> par ce que la fonction FAIT &mdash; ici &laquo; qui ecrit dans " + C % 'S.foodLog' +
    " ? &raquo;, qui trouve les <b>%d</b> ecrivains quelle que soit leur syntaxe) ; croiser avec "
    "les appelants (<i>la porte principale d'un ecran ne peut pas etre absente d'un inventaire de "
    "cet ecran</i>) ; et <b>dire le chiffre avec sa methode</b> &mdash; <i>&laquo; %d lignes "
    "correspondent au motif X, recompte a chaque generation &raquo;</i> se verifie ; "
    "<i>&laquo; il y a %d sites &raquo;</i> ne se verifie pas, parce qu'on ne sait meme pas "
    "ce qui a ete compte." % (ECRIVAINS, REGLE_G + REGLE_P, 6) +
    "<br/><br/>Soeur de <b>&sect;58</b> (<i>verifier la fonction n'est pas verifier l'appel</i>) et "
    "de <b>&sect;61</b> (<i>un outil de mesure tronque ressemble a un code sans defaut</i>) : les "
    "trois disent la meme chose a trois endroits &mdash; <b>l'instrument fait partie de la mesure</b>."))

# ── 6 ──
F.append(P("6. Comment on sait que rien n'a bouge", 'h1'))
F.append(tableau(
    ["preuve", "resultat"],
    [["<b>Instantane</b> " + C % 'tools/instantane_1b23.js' + " (11 sondes), avant / apres",
      "<b>identique octet pour octet</b>, meme sha256 " + C % 'ace2a744dc89e6ec' +
      " &mdash; <b>les sondes de 1b et 3 comprises</b>, donc l'extraction n'a pas deborde"],
     ["<b>Passe parcours</b> (bloc CCXCI, +15 temoins)",
      "<b>3564 / 3564</b> &mdash; et le total <b>predit</b> etait 3549 + 15 = 3564 : il colle, donc "
      "la passe n'est pas tronquee (&sect;61)"],
     ["Calculs / muscles / croises / dates",
      "<b>339</b> / <b>241</b> / <b>50</b> / <b>9</b>, tous verts"],
     ["Donnees classees face a Milo",
      "<b>aucun trou nouveau</b> (les 2 connus restent inchanges)"],
     ["<b>Controle negatif</b>", "<b>8 mutations, TOUTES mordent</b>, chacune sur son temoin"],
     ["Deploiement (R18)", "run <b>#1091</b>, " + C % 'success' + " a 08:02:02 UTC"]],
    [62 * mm, 103 * mm]))

F.append(Spacer(1, 4))
F.append(encadre(
    "UNE MUTATION A TUE MA SONDE AU LIEU DE LA FAIRE ROUGIR",
    "Le temoin des 4 macros ecrivait " + C % 'Object.keys(_per100Derive(...))' + ". Avec le "
    "proprietaire mute pour rendre " + C % 'null' + ", ca <b>leve</b> &mdash; l'" + C % 'evaluate' +
    " entier est rejete, et <b>le bloc disparait de la passe sans qu'elle rougisse</b>."
    "<br/><br/>Rendu defensif, la mutation fait desormais <b>7 rouges nommes</b>. "
    "<i>Un temoin qui MEURT ressemble a un temoin qui passe</i> &mdash; c'est <b>&sect;61</b> en "
    "miniature, et la raison est ecrite a l'endroit exact.", ORANGE))

# ── 7 ──
F.append(PageBreak())
F.append(P("7. Ce qui attend une decision de Michel", 'h1'))
F.append(P("<b>Deux questions, et elles ne sont pas techniques.</b> Elles sont ecrites dans "
           + C % 'docs/JOURNAL-DE-TEST.md' + " pour ne pas disparaitre avec la session (R27)."))
F.append(tableau(
    ["question", "ce qui en depend"],
    [["<b>1.</b> 1b et 3 se font-elles sur leur <b>perimetre reel</b> (un chantier ~3x plus gros "
      "que le plan), ou <b>re-decoupees</b> en morceaux plus petits ?",
      "le decoupage du chantier, et le nombre de versions avant le hub"],
     ["<b>2.</b> Les <b>defauts divergents</b> s'harmonisent-ils ?",
      "si <b>oui</b>, c'est une <b>decision produit</b> : elle change des lignes deja enregistrees. "
      "Si <b>non</b>, la &laquo; forme aliment &raquo; unique devra les <b>transporter</b> &mdash; "
      "ce qui limite beaucoup l'interet de l'etape"]],
    [82 * mm, 83 * mm]))

F.append(Spacer(1, 6))
F.append(P("<b>Hors perimetre, et ca le reste</b>", 'h2'))
F.append(tableau(
    ["sujet", "etat"],
    [["<b>Hub</b> (etape 4) et <b>douane</b> (etape 5)",
      "<b>apres</b> 1b et 3 &mdash; consigne explicite de Michel"],
     [C % 'S.savedFoods' + " perdu entre deux onglets",
      "<b>ouvert</b>. Le correctif evident est <b>faux</b> : une union par nom ferait "
      "<b>ressusciter une etoile retiree</b>. Decision produit"],
     ["L'ecart <b>48,3</b> vs <b>48</b> sur la meme fiche",
      "<b>ouvert</b>. Corriger changerait une valeur enregistree &mdash; ce n'est pas une extraction"],
     ["Historique abime, migrations, Milo, seances", "<b>non touches</b>"]],
    [62 * mm, 103 * mm]))

F.append(Spacer(1, 8))
F.append(encadre(
    "LIMITE DITE PLUTOT QUE TUE",
    "Le proxy de ce conteneur refuse " + C % 'github.io' + " (403), donc <b>je ne peux pas lire le "
    + C % 'sw.js' + " reellement servi</b>. La verification s'arrete a l'API GitHub : <i>le run est "
    "vert, l'app affichant " + C % VERSION + " reste a confirmer par Michel dans &laquo; A propos "
    "&raquo;.</i>", GRIS))

F.append(Spacer(1, 10))
F.append(P("Document genere depuis le code servi &mdash; <b>tous les decomptes cites sont recomptes "
           "a chaque generation</b> (%d proprietaire, %d appels, %d + %d ecritures de la regle, %d "
           "lignes de la moitie portions, %d colonnes CSV, %d ecrivains). <i>Un document qui cite un "
           "decompte sans le verifier refait exactement l'erreur qu'il raconte.</i> "
           % (PROPRIO, APPELS, REGLE_G, REGLE_P, MOITIE_PORTION, COLONNES, ECRIVAINS) +
           "Source : " + C % 'tools/gen_etape2_perimetre_pdf.py' + ".", 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=23 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker - etape 2 livree, perimetre de 1b et 3 mesure',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK -> %s (%d Ko)' % (OUT, os.path.getsize(OUT) // 1024))
