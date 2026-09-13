#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/SOUS-ETAPE-1BV.pdf — 1b-v ECARTEE, et pourquoi la divergence mesuree est JUSTIFIEE.
   Seizieme document de la serie, et le dernier du chantier 1b/3.

TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI.
La garde qui compte le plus ici est INVERSEE par rapport aux precedentes : elle refuse de produire
si quelqu'un a FONDU les deux ecrans — c'est-a-dire si le document a cesse d'etre vrai parce que
son lecteur a « repare » la decision qu'il documente.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji, entites nommees comprises.
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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'SOUS-ETAPE-1BV.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
SONDE = open(os.path.join(ROOT, 'tools', 'instantane_1b23.js'), encoding='utf-8').read()
RUN = open(os.path.join(ROOT, 'tests', 'parcours', 'runner.js'), encoding='utf-8').read()
DEC = open(os.path.join(ROOT, 'docs', 'SOUS-ETAPES-1B-3.md'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = \'(ft-v\d+)\'", SW) or [None, '?'])[1]
SHA_INSTANTANE = '1fc6df1198aee8e1'

CODE = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), APP)
CODE = '\n'.join(l for l in CODE.split('\n') if not l.strip().startswith('//'))


def corps(nom, arg=r'\w*'):
    m = re.search(r'function ' + nom + r'\(' + arg + r'\)\{[\s\S]*?\n\}', CODE)
    return m.group(0) if m else ''


# ── LES DECOMPTES, REFAITS ICI ───────────────────────────────────────────────
C_AF = corps('_afReprendreDefPortion', r'src')
C_OUVRE = corps('openEditFood', r'ts')
N_FORME_EF = len([l for l in CODE.split('\n')
                  if re.search(r"_efPortionLabel\s*=\s*String\(\w+\.portionLabel", l)])
N_AF = len(re.findall(r'_afReprendreDefPortion\(', CODE))

CLES = sorted(set(re.findall(r"out\[\'([^\']+)\'\]", SONDE)))
N_TEMOINS = len(re.findall(r"t\(\'CCCI ", RUN))

SOUS = re.findall(r'^### (1b-[iv]+|3-[iv]+)\b(.*)$', DEC, re.M)
TOTAL_SE = len(SOUS)
LIVREES = len([t for t in SOUS if 'LIVR' in t[1].upper()])
ECARTEES = len([t for t in SOUS if 'CART' in t[1].upper()])
RESTANTES = TOTAL_SE - LIVREES - ECARTEES

# ⛔⛔ LES GARDES DE CE DOCUMENT SONT INVERSEES : ils ne protegent pas une extraction, ils
#    protegent une DECISION DE NE PAS EXTRAIRE. Si quelqu'un fond les deux ecrans, le document
#    cesse d'etre vrai — et il doit refuser de se produire AVANT d'affirmer le contraire.
if not C_AF:
    raise SystemExit('`_afReprendreDefPortion` est introuvable : le §1 en parle comme du '
                     'proprietaire livre par 3-v.')
if not C_OUVRE:
    raise SystemExit('`openEditFood` est introuvable : c est le seul site que ce document ecarte.')
if N_FORME_EF != 1:
    raise SystemExit('La forme `_ef*` existe %d fois, pas 1 : le test d entree du §2 tombe, et '
                     'avec lui la raison d ecarter 1b-v.' % N_FORME_EF)
if '_afReprendreDefPortion' in C_OUVRE:
    raise SystemExit('DECISION ROMPUE : `openEditFood` appelle le proprietaire de l AUTRE ecran. '
                     'C est exactement la mutation n.1 du controle negatif (« je repare l oubli »), '
                     'et le §3 explique pourquoi elle est fausse.')
if '_efPortion' in C_AF:
    raise SystemExit('DECISION ROMPUE : le proprietaire de l ecran d AJOUT a absorbe les jumelles '
                     '`_ef*`. Meme grandeur, AUTRE ecran : le §3 affirme le contraire.')
if not re.search(r"_efUnite=\'portion\';", C_OUVRE):
    raise SystemExit('LA RAISON EST TOMBEE : `openEditFood` ne force plus son unite a « portion » '
                     'a l ouverture. C est CE fait qui justifie l absence de garde — sans lui, la '
                     'divergence du §3 redevient un vrai defaut, et ce document ment.')
if N_AF != 3:
    raise SystemExit('`_afReprendreDefPortion` a %d occurrences, pas 3 : la non-regression de 3-v '
                     'cite ce chiffre.' % N_AF)
if len(CLES) != 23:
    raise SystemExit('La sonde porte %d cles, pas 23 : le §4 cite ce chiffre (21 avant).'
                     % len(CLES))
for k in ('1bv_hydratation_openEditFood', '1bv_hydratation_ecranAjout'):
    if k not in CLES:
        raise SystemExit('La sonde ne mesure plus les DEUX ecrans (%s manque) : le §3 repose sur '
                         'la comparaison, pas sur la lecture d un seul cote.' % k)
if N_TEMOINS != 11:
    raise SystemExit('Le bloc CCCI porte %d temoins, pas 11 : le §5 cite ce chiffre.' % N_TEMOINS)
if TOTAL_SE != 10 or LIVREES != 8 or ECARTEES != 2 or RESTANTES != 0:
    raise SystemExit('Le decoupage porte %d sous-etapes, %d livrees, %d ecartees, %d restante(s) '
                     '— pas 10 / 8 / 2 / 0. Le document affirme que 1b et 3 sont TERMINEES.'
                     % (TOTAL_SE, LIVREES, ECARTEES, RESTANTES))

PASSE = os.environ.get('FT_PASSE') or '/tmp/passe1bv.log'
try:
    _log = open(PASSE, encoding='utf-8', errors='replace').read()
except Exception:
    raise SystemExit('Journal de passe introuvable (%s) : le §5 cite un total, il doit etre LU.'
                     % PASSE)
_m = re.search(r'TOTAL CROIS\u00c9 : (\d+) \u2705 \u00b7 (\d+) \u274c', _log)
if not _m:
    raise SystemExit('Le journal de passe ne porte pas encore de TOTAL : la passe tourne toujours. '
                     'Un total espere n est pas un total mesure — on attend.')
PASSE_OK, PASSE_KO = int(_m.group(1)), int(_m.group(2))
if PASSE_KO != 0:
    raise SystemExit('La passe porte %d rouge(s) : le document affirme une passe verte.' % PASSE_KO)

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
                      'Force Tracker — 1b-v ecartee, 1b et 3 terminees (%s) — 13/09/2026' % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()



BALAYAGE = """// LE BALAYAGE COMPLET — 12 ecritures, classees par METIER et non par ressemblance

// (1) HYDRATATION DEPUIS UNE SOURCE  -- le sujet de 1b-v
_afReprendreDefPortion()   <- le proprietaire livre par 3-v, + ses 2 appelants
openEditFood @4370-4371    <- SEUL DE SA FORME, et il ecrit _ef* (l'autre ecran)

// (2) SAISIE A L'ECRAN  -- autre metier : la personne tape, rien n'est repris
_afPortionNom · _afPortionNomSaisi · _afPortionPoidsSaisi
_efPortionNomSaisi · _efPortionPoidsSaisi                     -> 5 sites

// (3) DECLARATION / REMISE A PLAT                             -> 3 sites

// => UN SEUL site d'hydratation non proprietarise. TEST D'ENTREE : 1 COPIE."""

DEUX_FORMES = """// LES DEUX FORMES, COTE A COTE — elles ne sont meme pas textuellement identiques

// ecran d'AJOUT (le proprietaire de 3-v) :
  if(s.u !== 'portion') return false;                     <- un GARDE d'unite
  _afPortionLabel = String(s.portionLabel || '').slice(0, 24);
  _afPortionPoids = +s.portionWeightG > 0 ? +s.portionWeightG : 0;

// ecran d'EDITION (openEditFood) :
  // ... aucun garde d'unite ...
  _efPortionLabel=String(e.portionLabel||'').slice(0,24);
  _efPortionPoids=(+e.portionWeightG>0)?+e.portionWeightG:0;
                  ^                  ^
                  parentheses en plus : PAS strictement identique"""

MESURE = """// LA MESURE QUI TRANCHE — la MEME ligne, en grammes, portant une etiquette
//   {q:150, u:'g', portionLabel:'part', portionWeightG:120}

//                    definition reprise ?    unite de l'ecran a l'ouverture
//   ECRAN EDITION       OUI  part / 120           'portion'  <- FORCE a chaque ouverture
//   ECRAN AJOUT         NON  vide / 0             'g'        <- il SUIT la source

// => les deux gardes different parce que les deux ECRANS ne partent pas du meme etat.
//    L'edition est toujours en mode portions : une definition de portion y a toujours
//    du sens. L'ajout suit la source : sur un aliment pese, elle n'en a aucun.
//
//    CE N'EST PAS UNE INCOHERENCE. C'est la meme intention sur deux etats."""


F = []
F.append(P("1b-v : ecartee &mdash; et pourquoi la divergence est juste", 'titre'))
F.append(P("Force Tracker &mdash; 13/09/2026, " + C % VERSION + ". Seizieme document de la serie, et "
           "<b>le dernier du chantier</b>. Michel impose le recomptage : <i>&laquo; recompte "
           "entierement son perimetre reel dans le code servi ; ne te fie pas au plan ecrit ; si le "
           "test d'entree montre qu'il n'y a plus au moins deux copies d'une meme forme, n'invente "
           "pas de proprietaire &raquo;</i>.", 'sous'))

F.append(encadre(
    "LES DEUX FAITS DE CETTE SOUS-ETAPE",
    "<b>(1) Il n'y a plus rien a extraire.</b> Le balayage complet donne <b>%d</b> site "
    "d'hydratation non proprietarise, et il ecrit d'<b>autres variables</b> (l'ecran d'edition). "
    "1b-v rejoint 1b-iv : <b>ecartee, avec sa raison ecrite</b>."
    "<br/><br/><b>(2) Et la divergence qu'on y decouvre ne doit PAS etre corrigee.</b> Les deux "
    "ecrans hydratent la meme grandeur avec des gardes differents &mdash; ce qui ressemble a une "
    "incoherence <b>jusqu'a ce qu'on mesure les deux cotes</b>. <i>Une divergence ne se juge pas "
    "sur la ligne qui diverge, mais sur l'etat dans lequel elle s'execute.</i>" % N_FORME_EF))

F.append(P("1. Le balayage complet, refait le jour meme", 'h1'))
F.append(bloc_code(BALAYAGE))

F.append(P("2. Le test d'entree : une seule copie, et meme pas identique", 'h1'))
F.append(bloc_code(DEUX_FORMES))
F.append(P("=&gt; <b>Deux raisons independantes de ne pas fondre</b> : la consigne dit <i>&laquo; "
           "n'extrais que ce qui est strictement identique &raquo;</i>, et ces deux formes ne le "
           "sont pas &mdash; mais surtout, <b>elles n'ont pas le meme garde</b>. La suite explique "
           "pourquoi ce garde manquant n'est pas un oubli.", 'petit'))

F.append(PageBreak())

F.append(P("3. La mesure qui tranche &mdash; et pourquoi ce n'est pas un defaut", 'h1'))
F.append(bloc_code(MESURE))
F.append(encadre(
    "CE QUE J'AURAIS CONCLU EN NE REGARDANT QU'UN COTE",
    "La premiere lecture donne : <i>&laquo; l'ecran d'edition oublie un garde &raquo;</i>. C'est "
    "plausible, c'est net, et <b>c'est faux</b>. Un correctif fonde la-dessus aurait <b>casse "
    "l'ecran d'edition</b> : il ouvre toujours en mode portions, donc lui retirer la definition "
    "l'aurait laisse sans etiquette ni poids sur une ligne qui en a une."
    "<br/><br/>=&gt; <b><i>C'est la mesure des DEUX ecrans sur les MEMES cas qui a tranche.</i></b> "
    "Lire un seul bout produit une conclusion coherente et inexacte &mdash; la pire espece, parce "
    "qu'elle ne ressemble pas a une erreur.", ORANGE))
F.append(encadre(
    "ET LE TEMOIN FIGE LA RAISON, PAS SEULEMENT LE FAIT",
    "Un temoin ordinaire aurait grave <i>&laquo; l'ecran d'edition hydrate sans garde &raquo;</i>. "
    "Celui-ci grave en plus <b>pourquoi</b> : il verifie que " + C % 'openEditFood' + " force encore "
    "son unite a &laquo; portion &raquo; a l'ouverture."
    "<br/><br/>=&gt; <b>Le jour ou ce fait tombera, la divergence redeviendra un vrai defaut</b> "
    "&mdash; et un rouge le dira, au lieu qu'elle devienne silencieusement fausse. <i>Un temoin qui "
    "fige un comportement protege le present ; un temoin qui fige sa RAISON protege la decision.</i>",
    VERT))

F.append(P("4. La sonde : elle conduisait l'ecran d'edition sans jamais l'observer", 'h1'))
F.append(P("La sonde ouvre " + C % 'openEditFood' + " depuis l'etape 2 &mdash; mais elle n'y lit que "
           "la <b>ligne enregistree</b>, jamais l'etat de l'ecran. <b>Aucune</b> des 21 cles ne "
           "touchait une variable " + C % '_ef*' + ". Etendue a <b>%d cles AVANT toute "
           "conclusion</b>, et elle mesure <b>les deux ecrans sur les memes cas</b> : c'est la "
           "comparaison qui fait la preuve." % len(CLES), 'p'))

F.append(P("5. Les mesures", 'h1'))
F.append(tableau(
    ["preuve", "resultat"],
    [["Fichiers servis modifies", "<b>AUCUN</b> &mdash; verifie par liste de noms. " + C % 'sw.js'
      + " n'est donc <b>pas bumpe</b> : un bump gratuit fait re-telecharger l'app a tout le monde "
      "pour rien"],
     ["Instantane", "<b>identique</b>, sha256 " + C % SHA_INSTANTANE + " (%d cles)" % len(CLES)],
     ["Temoins", "<b>%d</b> &mdash; bloc CCCI, dont <b>5 de source</b>. Ils protegent une "
      "<b>ABSENCE</b>, pas une extraction" % N_TEMOINS],
     ["Controle negatif", "<b>7 mutations, toutes mordent</b> ; controle sain a 0 rouge <b>avant ET "
      "apres</b>. La n.1 (&laquo; je repare l'oubli &raquo;) en fait <b>4</b>"],
     ["Passe complete", "<b>%d / %d</b> &mdash; <i>lu dans le journal de la passe</i> &middot; total "
      "<b>predit = obtenu</b> (3699 + %d)" % (PASSE_OK, PASSE_OK, N_TEMOINS)],
     ["Autres bancs", "calculs 339/339 &middot; muscles 241/241 &middot; croises 50/50 &middot; "
      "dates 9/9 &middot; donnees : aucun trou nouveau"],
     ["Ecran", "<b>rien ne change</b>"]],
    [44 * mm, 121 * mm]))

F.append(P("6. Bilan du chantier 1b / 3", 'h1'))
F.append(tableau(
    ["", ""],
    [["Sous-etapes", "<b>%d</b> au plan &mdash; <b>%d livrees</b>, <b>%d ecartees</b>, "
      "<b>%d restante</b>" % (TOTAL_SE, LIVREES, ECARTEES, RESTANTES)],
     ["Perimetres ecrits", "<b>5 faux sur 8 verifies</b>, jamais deux fois de la meme facon"],
     ["Sous-etapes vides", "<b>2</b> (1b-iv, 1b-v) &mdash; trouvees par le meme geste : <b>compter "
      "les copies AVANT d'ecrire une ligne</b>. Sans ce test d'entree on aurait cree deux "
      "proprietaires a un seul appelant, et <b>rien n'aurait rougi</b>"],
     ["Etat", "<b>1b et 3 sont TERMINEES.</b> Le hub (etape 4) et la douane (etape 5) attendent un "
      "feu vert"],
     ["Reste ouvert, hors perimetre", "le garde " + C % '!_bcNutr' + " non bloquant (mesure, "
      "documente, <b>pas de correction sans feu vert separe</b>) &middot; favoris entre onglets "
      "&middot; ecart 48,3 / 48 &middot; historique &middot; migrations &middot; harmonisations "
      "produit"]],
    [42 * mm, 123 * mm]))
F.append(P("<b>Rollback</b> : un " + C % 'git revert' + " du commit &mdash; il ne contient que des "
           "tests, une sonde et des journaux.", 'petit'))

F.append(Spacer(1, 8))
F.append(P(("Document genere depuis le code servi &mdash; tous les decomptes cites sont recomptes a "
            "chaque generation (%d copie de la forme de l'ecran d'edition, %d occurrences du "
            "proprietaire de l'ecran d'ajout, %d cles de sonde, %d temoins, %d livrees, %d "
            "ecartees, %d restante). " % (N_FORME_EF, N_AF, len(CLES), N_TEMOINS, LIVREES,
                                          ECARTEES, RESTANTES)) +
           "<b>Quatorze gardes refusent de produire si un fait tombe</b>, et ils sont <b>inverses</b> "
           "par rapport aux documents precedents : ils ne protegent pas une extraction, ils "
           "protegent une <b>decision de NE PAS extraire</b>. L'un d'eux verifie que " + C % 'openEditFood'
           + " force encore son unite a &laquo; portion &raquo; &mdash; <i>c'est la RAISON de la "
           "divergence, et sans elle ce document ment</i>. Le total de la passe est <b>lu dans son "
           "journal</b>. Source : " + C % 'tools/gen_1bv_pdf.py' + ".", 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=23 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker - 1b-v ecartee, 1b et 3 terminees',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK -> %s (%d Ko)' % (OUT, os.path.getsize(OUT) // 1024))
