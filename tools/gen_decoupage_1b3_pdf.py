#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/DECOUPAGE-1B-3.pdf — le redecoupage de 1b et 3, et la sous-etape 1b-i.

   Septieme document de la serie : DOUANE -> ARCHI -> PLAN -> PHASE0A-ETAPE1A -> VALIDATION-IPHONE
   -> ETAPE2-ET-PERIMETRE -> CELUI-CI. Michel tranche les deux questions laissees ouvertes :
   pas de gros chantier (des sous-etapes reversibles), et les defauts divergents se TRANSPORTENT
   au lieu d'etre harmonises.

⭐⭐ TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, Y COMPRIS LE NOMBRE DE SOUS-ETAPES.
   Ce garde-la n'est pas decoratif : la premiere redaction annoncait « 9 sous-etapes dont 4 sur la
   paire », alors qu'il y en a **10 dont 5**. Le chiffre etait parti dans CINQ fichiers avant
   d'etre repris. *C'est exactement le defaut que ce chantier documente — un chiffre rond que
   personne ne recompte — et il fallait bien qu'il se produise ici aussi.*

⚠️ CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji, entites nommees comprises.
"""
import difflib
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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'DECOUPAGE-1B-3.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
DOC = open(os.path.join(ROOT, 'docs', 'SOUS-ETAPES-1B-3.md'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = '(ft-v\d+)'", SW) or [None, '?'])[1]


def _commentaire(l):
    x = l.strip()
    return x.startswith('*') or x.startswith('//') or x.startswith('/*') or x.startswith('`')


LA = [l for l in APP.split('\n') if not _commentaire(l)]


def corps(nom):
    m = re.search(r'^function ' + nom + r'\(.*?^\}', APP, re.M | re.S)
    return m.group(0) if m else ''


def utiles(txt):
    return [re.sub(r'\s+', ' ', l).strip() for l in txt.split('\n')
            if l.strip() and not _commentaire(l)]


# ── LES DECOMPTES, REFAITS ICI ───────────────────────────────────────────────
SOUS_ETAPES = len(re.findall(r'^### (?:1b|3)-', DOC, re.M))
_BLOCS = re.split(r'^### ', DOC, flags=re.M)[1:]
PAIRE = len([b for b in _BLOCS if 'quickFillFood' in b and '_afSuggPrendreLocale' in b])

APPELS = len(re.findall(r'_srcRepriseQ\(', APP))
PROPRIO = len([l for l in LA if re.search(r'q\s*:\s*_?qOk\s*\?', l)])

RE_P = re.compile(r"\+\w+\.q>0 && \(!\w+\.u\|\|\w+\.u==='g'\|\|\w+\.u==='portion'\)")
DECIDEURS = len([n for n in ('rejouerRepas', 'quickAddFood') if RE_P.search(corps(n))])
# ⛔⛔ ON NE LIT QUE LE CODE, ET CE GARDE A MORDU SUR MON PROPRE COMMENTAIRE POUR LE
#    DECOUVRIR. `rejouerRepas` porte desormais la ligne « PAS de `sourceId`/`etat` ici, et
#    ce n'est pas un oubli » — donc le mot apparait dans son corps, dans un commentaire qui
#    dit EXACTEMENT le contraire de ce que le garde croyait lire.
#    👉 Un controle qui ne distingue pas le CODE de ce qui en PARLE finit par interdire
#       d'ecrire la documentation de la decision qu'il protege. (Meme piege qu'en ft-v1193.)
def _sansCommentaires(txt):
    return '\n'.join(l for l in txt.split('\n') if not _commentaire(l))

REJEU_SANS = 'sourceId' not in _sansCommentaires(corps('rejouerRepas'))
DIRECT_AVEC = 'sourceId' in _sansCommentaires(corps('quickAddFood'))

# ⭐ LA MESURE QUI PORTE LE TITRE DU DOCUMENT, REFAITE A CHAQUE GENERATION.
_A, _B = utiles(corps('quickFillFood')), utiles(corps('_afSuggPrendreLocale'))


def _norm(ls):
    out = []
    for l in ls:
        l = re.sub(r'\bit\b', 'X', l)
        l = re.sub(r'\be\b', 'X', l)
        out.append(l)
    return out


_SM = difflib.SequenceMatcher(None, _norm(_A), _norm(_B))
COMMUNES = sum(b.size for b in _SM.get_matching_blocks())
RATIO = round(_SM.ratio() * 100)

# ⛔ CHAQUE GARDE PROTEGE UNE AFFIRMATION DU DOCUMENT.
if SOUS_ETAPES != 10:
    raise SystemExit('Le decoupage compte %d sous-etapes, pas 10 — le §2 et le §4 sont faux. '
                     '(C\'est CE garde qui a attrape le « 9 » parti dans cinq fichiers.)' % SOUS_ETAPES)
if PAIRE != 5:
    raise SystemExit('%d sous-etapes portent sur la paire quickFillFood / _afSuggPrendreLocale, '
                     'pas 5 — le chiffre du §1 est faux.' % PAIRE)
if APPELS != 3:
    raise SystemExit('`_srcRepriseQ` a %d occurrences, pas 3 (1 declaration + 2 appelants). '
                     'Le §3 repose dessus.' % APPELS)
if PROPRIO != 1:
    raise SystemExit('Le bloc `q:qOk?…` existe %d fois dans le CODE, pas 1 — le document affirme '
                     'un proprietaire UNIQUE.' % PROPRIO)
if DECIDEURS != 2:
    raise SystemExit('%d fonctions sur 2 calculent encore `qOk` en propre — l\'etape 3 a ete faite '
                     'au passage, ce que le §3 affirme ne PAS avoir fait.' % DECIDEURS)
if not REJEU_SANS:
    raise SystemExit('`rejouerRepas` pose maintenant `sourceId` : l\'ecart TRANSPORTE a ete '
                     'harmonise, or c\'est une decision produit (§5). Le document ment.')
if not DIRECT_AVEC:
    raise SystemExit('`quickAddFood` ne pose plus `sourceId` : l\'autre moitie de l\'ecart a '
                     'disparu. Le document ment.')
if COMMUNES < 30:
    raise SystemExit('Les deux fonctions ne partagent plus que %d lignes utiles — le fait qui '
                     'porte tout le §1 n\'est plus vrai.' % COMMUNES)

AVANT = """// AVANT — le meme bloc, recopie caractere pour caractere

// rejouerRepas                                    // quickAddFood
_afSetSrc({saisie:'liste',origine:'reprise',       _afSetSrc({saisie:'liste', origine:'reprise',
  q:qOk?+e.q:null,                                   q:_qOk ? +it.q : null,
  u:qOk?(e.u||'g'):null,                             u:_qOk ? (it.u||'g') : null,
  per100:e.per100||null,                             per100:it.per100||null,
                                                     sourceId:it.sourceId||null,   // <- en PLUS
                                                     etat:it.etat||null,           // <- en PLUS
  portionLabel:e.portionLabel||null,                 portionLabel:it.portionLabel||null,
  portionWeightG:+e.portionWeightG>0                 portionWeightG:+it.portionWeightG>0
    ?+e.portionWeightG:null});                         ?+it.portionWeightG:null});"""

APRES = """// APRES — un proprietaire, et l'ecart reste VISIBLE dans l'appel

function _srcRepriseQ(src, qOk){
  const s = src || {};
  return { q: qOk ? +s.q : null,
           u: qOk ? (s.u || 'g') : null,
           per100: s.per100 || null,
           portionLabel: s.portionLabel || null,
           portionWeightG: +s.portionWeightG > 0 ? +s.portionWeightG : null };
}

// rejouerRepas — PAS de sourceId/etat, et ce n'est pas un oubli
_afSetSrc(Object.assign({saisie:'liste',origine:'reprise'}, _srcRepriseQ(e, qOk)));

// quickAddFood — la porte jumelle les pose, elle
_afSetSrc(Object.assign({saisie:'liste', origine:'reprise'},
                        _srcRepriseQ(it, _qOk),
                        {sourceId:it.sourceId||null, etat:it.etat||null}));"""

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
                      'Force Tracker — decoupage de 1b et 3, sous-etape 1b-i (%s) — 12/09/2026'
                      % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("Decoupage de 1b et 3 en sous-etapes, et la premiere livree", 'titre'))
F.append(P("Force Tracker &mdash; 12/09/2026, " + C % VERSION + ". Septieme document de la serie. "
           "Michel tranche les deux questions laissees ouvertes par le precedent : <b>pas de gros "
           "chantier</b>, et <b>les defauts divergents se transportent au lieu d'etre "
           "harmonises</b>. <b>Une seule sous-etape sur %d est livree</b>, et c'est voulu."
           % SOUS_ETAPES, 'sous'))

F.append(encadre(
    "LES DEUX DECISIONS, MOT POUR MOT",
    "<i>&laquo; Je ne veux pas traiter 1b et 3 en un seul gros chantier. Redecoupe-les en "
    "sous-etapes plus petites, <b>mesurables et reversibles</b>. &raquo;</i>"
    "<br/><br/><i>&laquo; Je ne veux pas harmoniser maintenant les defauts divergents "
    "(" + C % '0' + ", " + C % 'null' + ", cle absente, origine differente). A ce stade, on doit "
    "les <b>TRANSPORTER explicitement sans les corriger</b>. &raquo;</i>"
    "<br/><br/><b>L'objectif reste inchange</b> : extraction &middot; proprietaire unique &middot; "
    "<b>aucun</b> changement de comportement &middot; <b>aucune</b> modification silencieuse des "
    "lignes existantes.", ORANGE))

# ── 1 ──
F.append(P("1. Ce que la mesure a nomme, et qui a change le decoupage", 'h1'))
F.append(P("<b>" + C % 'quickFillFood' + " et " + C % '_afSuggPrendreLocale' + " partagent %d lignes "
           "utiles IDENTIQUES</b> &mdash; diff normalise, %d et %d lignes utiles, <b>%d %% de "
           "squelette commun</b>." % (COMMUNES, len(_A), len(_B), RATIO)))
F.append(P("<b>Ce ne sont pas quinze sites eparpilles : c'est LA REPRISE D'UN ALIMENT A "
           "L'ECRAN, ECRITE DEUX FOIS.</b> L'une prend l'item dans &laquo; Mes aliments &raquo;, "
           "l'autre dans la recherche du journal &mdash; et a partir de la, elles font la meme chose."))
F.append(encadre(
    "ET L'HISTORIQUE LE DISAIT DEJA : ON NE L'AVAIT JAMAIS COMPTE",
    "<b>ft-v973</b>, <b>ft-v975</b>, <b>ft-v984</b> et <b>ft-v1176</b> ont <b>chacune</b> porte un "
    "correctif d'une porte a l'autre. Les commentaires du code le repetent mot pour mot : "
    "<i>&laquo; le mecanisme existait, pose sur une seule des deux portes &mdash; pour la 6<super>e</super> "
    "fois dans ce fichier &raquo;</i>."
    "<br/><br/><b>%d des %d sous-etapes portent sur cette paire</b> (1b-ii &middot; 1b-v "
    "&middot; 3-ii &middot; 3-iii &middot; 3-v). <b>C'est la qu'est le gisement</b> &mdash; et c'est "
    "pour ca que le decoupage n'est pas &laquo; un site par sous-etape &raquo; mais "
    "<b>un MOTIF par sous-etape</b>." % (PAIRE, SOUS_ETAPES), VERT))

# ── 2 ──
F.append(P("2. La regle de decoupage", 'h1'))
F.append(P("Une sous-etape est valide si elle reunit <b>les quatre</b> :"))
F.append(tableau(
    ["critere", "ce que ca veut dire concretement"],
    [["<b>une seule chose</b>",
      "elle n'extrait qu'<b>UN</b> motif. Deux motifs = un retour arriere qui ne peut plus etre partiel"],
     ["<b>mesurable</b>",
      "l'instantane " + C % 'tools/instantane_1b23.js' + " couvre deja ses sites, <b>ou</b> on ecrit "
      "la sonde <b>AVANT</b>"],
     ["<b>reversible</b>", "un " + C % 'git revert' + " d'un seul commit suffit, et il ne casse rien d'autre"],
     ["<b>honnete sur les defauts</b>",
      "tout ecart entre sites est <b>transporte</b> et <b>fige par un temoin</b> &mdash; jamais lisse"]],
    [42 * mm, 123 * mm]))
F.append(P("<b>Et le critere de reussite reste binaire</b> : instantane <b>identique octet "
           "pour octet</b> avant et apres.", 'petit'))

# ── 3 ──
F.append(PageBreak())
F.append(P("3. Ce qui est livre : la sous-etape 1b-i", 'h1'))
F.append(bloc_code(AVANT))
F.append(Spacer(1, 4))
F.append(bloc_code(APRES))
F.append(Spacer(1, 4))
F.append(encadre(
    "`qOk` N'EST PAS CALCULE DEDANS, ET C'EST TOUT LE DECOUPAGE",
    "Le test <i>&laquo; cette quantite est-elle utilisable ? &raquo;</i> est le sujet de "
    "<b>l'etape 3</b>. L'absorber ferait <b>deux extractions dans une seule sous-etape</b>, donc un "
    "retour arriere qui ne peut plus etre partiel."
    "<br/><br/><b><i>Une sous-etape reversible est une sous-etape qui ne fait qu'UNE "
    "chose.</i></b> Un <b>temoin de perimetre</b> l'exige : il verifie que " + C % 'rejouerRepas' +
    " <b>et</b> " + C % 'quickAddFood' + " calculent <b>encore chacun</b> " + C % 'qOk' +
    " dans leur propre corps."))
F.append(Spacer(1, 4))
F.append(encadre(
    "ET CE QUI N'EST PAS DEDANS COMPTE AUTANT",
    C % 'sourceId' + " et " + C % 'etat' + " restent chez " + C % 'quickAddFood' + " <b>seul</b> : "
    "le rejeu ne les a <b>jamais</b> poses. <b>La divergence est TRANSPORTEE, pas corrigee.</b>"
    "<br/><br/>Les lui donner changerait la <b>provenance ENREGISTREE</b> d'une ligne rejouee &mdash; "
    "elle affirmerait venir d'un code-barres qu'on n'a pas relu (<b>R33</b> : la provenance ne ment "
    "pas). <b>Deux temoins figent les deux moities</b> : l'un exige leur <b>ABSENCE</b> au rejeu, "
    "l'autre leur <b>PRESENCE</b> a la porte directe.", VERT))

# ── 4 ──
F.append(P("4. Le decoupage complet (%d sous-etapes)" % SOUS_ETAPES, 'h1'))
F.append(P("<b>1b &mdash; la &laquo; forme aliment &raquo;</b>", 'h2'))
F.append(tableau(
    ["sous-etape", "perimetre", "sites", "instantane"],
    [["<b>1b-i</b> <i>(livree)</i>", "la quantite reprise d'une ligne", "2, caractere pour caractere",
      "<b>oui</b> &mdash; couvert"],
     ["<b>1b-ii</b>", "la provenance " + C % '{sourceId,etat,per100}', "3",
      "<b>a etendre d'abord</b>"],
     ["<b>1b-iii</b>", "l'item de liste affichee", "3", "<b>oui</b> &mdash; couvert"],
     ["<b>1b-iv</b>", "l'export CSV, 13 colonnes", "1 (" + C % 'setup.js' + ")",
      "<b>AUCUNE &mdash; prerequis</b>"],
     ["<b>1b-v</b>", "l'hydratation des ecrans", "4", "apres 3-v"]],
    [22 * mm, 58 * mm, 45 * mm, 40 * mm]))
F.append(Spacer(1, 4))
F.append(P("<b>3 &mdash; &laquo; cette quantite est-elle utilisable ? &raquo;</b>", 'h2'))
F.append(tableau(
    ["sous-etape", "perimetre", "sites", "note"],
    [["<b>3-i</b>", "la forme &laquo; avec portions &raquo;", "2, identiques",
      "suite naturelle de 1b-i"],
     ["<b>3-ii</b>", "la pastille &laquo; ta derniere quantite &raquo;", "2, identiques", "la paire"],
     ["<b>3-iii</b>", "l'ouverture du bloc code-barres", "2, identiques",
      "<b>attention</b> : le garde " + C % '!_bcNutr' + " ne part PAS avec"],
     ["<b>3-iv</b>", C % '_provFood' + " : les 2 branches", "1", "<b>EN DERNIER : le seul "
      "qui ECRIT</b>"],
     ["<b>3-v</b>", "la reprise des portions a l'ecran", "2 x 2 lignes", "avant 1b-v"]],
    [22 * mm, 58 * mm, 33 * mm, 52 * mm]))
F.append(P("<b>Deux sous-etapes portent un PREREQUIS</b> : 1b-ii et 1b-iv n'ont <b>aucune "
           "sonde</b> aujourd'hui. La sonde s'ecrit <b>avant</b> de toucher au code &mdash; sinon le "
           "critere <i>&laquo; instantane identique &raquo;</i> ne veut rien dire.", 'petit'))

# ── 5 ──
F.append(PageBreak())
F.append(P("5. Quand une harmonisation devient une DECISION PRODUIT", 'h1'))
F.append(encadre(
    "LE CRITERE, ET IL NE DEPEND PAS DU CODE",
    "<b><i>Est-ce que le changement modifie ce qui est ECRIT dans " + C % 'S.foodLog' + " ou "
    + C % 'S.savedFoods' + " ?</i></b>"
    "<br/><br/>Si oui, ce n'est plus une extraction &mdash; c'est une decision, et elle revient a "
    "Michel."))
F.append(Spacer(1, 4))
F.append(tableau(
    ["#", "l'harmonisation tentante", "ce qu'elle changerait VRAIMENT", "ou"],
    [["<b>1</b>", "donner " + C % 'sourceId' + "/" + C % 'etat' + " a " + C % 'rejouerRepas',
      "la <b>provenance enregistree</b> d'une ligne rejouee : elle affirmerait venir d'un "
      "code-barres qu'on n'a pas relu (<b>R33</b>)", "1b-ii"],
     ["<b>2</b>", "unifier " + C % '0' + " / " + C % 'null' + " / cle absente",
      "le <b>contenu de " + C % 'S.savedFoods' + "</b>. Un " + C % '0' + " et un " + C % 'null' +
      " ne se relisent pas pareil en aval (" + C % '+x&gt;0' + " les traite pareil, " + C % 'x===null' +
      " non)", "1b-iii"],
     ["<b>3</b>", "faire accepter les portions aux 5 sites &laquo; grammes seuls &raquo;",
      "des lignes qui repartent aujourd'hui <b>sans quantite</b> en repartiraient <b>avec</b>. "
      "C'est un <b>changement de comportement</b>", "3-ii/iii/iv"],
     ["<b>4</b>", "unifier " + C % 'origine' + " (3 formulations)",
      "ce que le journal <b>dit de lui-meme</b>. Au moins une des trois est un choix assume", "1b-ii"]],
    [10 * mm, 45 * mm, 88 * mm, 22 * mm]))
F.append(P("<b>Tant que ces quatre ne sont pas tranchees, chaque sous-etape les TRANSPORTE "
           "et les FIGE par un temoin.</b> <i>C'est le seul moyen qu'une harmonisation future soit "
           "un CHOIX, et pas un effet de bord qu'on decouvre trois versions plus tard.</i>"))

# ── 6 ──
F.append(P("6. Les mesures, et deux pieges de temoin", 'h1'))
F.append(tableau(
    ["preuve", "resultat"],
    [["<b>Instantane</b> (11 sondes), avant / apres",
      "<b>identique octet pour octet</b>, meme sha256 " + C % 'ace2a744dc89e6ec' + " qu'en ft-v1194"],
     ["<b>Passe parcours</b> (bloc CCXCII, +14 temoins)",
      "<b>3578 / 3578</b> &mdash; total <b>predit</b> 3564 + 14 = 3578, il colle (&sect;61)"],
     ["Calculs / muscles / croises / dates",
      "<b>339</b> / <b>241</b> / <b>50</b> / <b>9</b>, tous verts"],
     ["<b>Controle negatif</b>", "<b>10 mutations, TOUTES mordent</b>"],
     ["Deploiement (R18)", "run <b>#1096</b>, " + C % 'success' + " a 11:39:31 UTC"]],
    [62 * mm, 103 * mm]))
F.append(Spacer(1, 6))
F.append(encadre(
    "PIEGE 1 &mdash; UN TEMOIN QUI MESURAIT UN ETAT INATTEIGNABLE",
    "Mon temoin du defaut appelait " + C % "_srcRepriseQ({name:'Nu'}, true)" + ". Avec " + C % 'qOk' +
    " vrai et pas de " + C % 'q' + ", " + C % '+undefined' + " vaut <b>NaN</b> &mdash; que "
    + C % 'JSON.stringify' + " serialise en <b>" + C % 'null' + "</b>."
    "<br/><br/><i>Le temoin aurait ete vert sur un NaN en croyant voir un " + C % 'null' +
    "</i>, et sur un etat que les deux portes ne peuvent pas produire (" + C % 'qOk' + " n'est vrai "
    "que si " + C % '+q&gt;0' + "). <b>Un temoin qui fige un etat inatteignable ne protege rien, et "
    "masque le type reel de ce qu'il mesure.</b>", ORANGE))
F.append(Spacer(1, 4))
F.append(encadre(
    "PIEGE 2 &mdash; LE CONTROLE NEGATIF A CORRIGE MON TEMOIN DE PERIMETRE",
    "La mutation <i>&laquo; l'etape 3 faite au passage &raquo;</i> rendait <b>0 rouge</b>. Ma "
    "1<super>re</super> version comptait les <b>LIGNES</b> portant le motif &mdash; or extraire une "
    "regle en laisse une <b>dans le proprietaire</b> et une <b>chez l'autre appelant</b> : le compte "
    "restait a 2, et le temoin passait <b>au vert sur exactement ce qu'il devait interdire</b>."
    "<br/><br/><b><i>Compter les occurrences d'un motif ne dit pas QUI decide.</i></b> Le "
    "temoin exige desormais que les <b>DEUX fonctions portent la regle chacune dans son propre "
    "corps</b>. <b>C'est " + C % 'BUGS.md' + " &sect;63 retourne contre mon propre temoin</b>, ecrite "
    "la veille."
    "<br/><br/><b>Et ma premiere mutation de ce cas etait mal faite</b> : elle declarait le "
    "helper <b>a l'interieur</b> de " + C % 'quickAddFood' + ", donc le motif restait dans son corps "
    "et le temoin corrige ne rougissait toujours pas. <i>Une mutation mal placee ressemble trait "
    "pour trait a un temoin aveugle.</i>", ORANGE))

# ── 7 ──
F.append(PageBreak())
F.append(P("7. Et le chiffre de ce document a ete faux, pendant cinq fichiers", 'h1'))
F.append(encadre(
    "LE DEFAUT QUE CE CHANTIER DOCUMENTE, COMMIS DANS LE CHANTIER LUI-MEME",
    "La premiere redaction annoncait <b>&laquo; 9 sous-etapes dont 4 sur la paire &raquo;</b>. "
    "Recompte : il y en a <b>" + str(SOUS_ETAPES) + " dont " + str(PAIRE) + "</b>."
    "<br/><br/>Le &laquo; 9 &raquo; etait deja parti dans <b>CINQ fichiers</b> &mdash; le decoupage, "
    + C % 'CLAUDE.md' + ", " + C % 'sw.js' + ", le journal de partage et le contexte &mdash; avant "
    "d'etre repris."
    "<br/><br/><b><i>C'est exactement le defaut de &sect;63 : un chiffre rond que personne "
    "ne recompte.</i></b> Il fallait bien qu'il se produise ici aussi, dans le document qui le "
    "denonce."
    "<br/><br/><b>Ce qui l'a attrape est le garde du generateur de ce PDF</b>, qui recompte "
    "les sous-etapes depuis le document source a chaque generation. <i>Un garde n'est utile que s'il "
    "mesure ce que le texte AFFIRME, pas ce que l'auteur croit.</i>"))

F.append(Spacer(1, 8))
F.append(P("8. Ce qui ne bouge pas", 'h1'))
F.append(tableau(
    ["sujet", "etat"],
    [["Le <b>hub</b> (etape 4) et la <b>douane</b> (etape 5)",
      "<b>apres</b> 1b et 3 &mdash; consigne inchangee"],
     [C % 'S.savedFoods' + " perdu entre deux onglets",
      "<b>ouvert</b> &mdash; l'union par nom ferait ressusciter une etoile retiree. Decision produit"],
     ["L'ecart <b>48,3</b> vs <b>48</b>",
      "<b>ouvert</b> &mdash; corriger changerait une valeur enregistree"],
     ["L'historique abime, les migrations", "<b>non touches</b>"],
     ["Les <b>%d autres sous-etapes</b>" % (SOUS_ETAPES - 1),
      "ecrites, ordonnees et dependancees dans " + C % 'docs/SOUS-ETAPES-1B-3.md']],
    [62 * mm, 103 * mm]))

F.append(Spacer(1, 10))
F.append(P("Document genere depuis le code et le decoupage servis &mdash; <b>tous les decomptes "
           "cites sont recomptes a chaque generation</b> (%d sous-etapes, %d sur la paire, %d lignes "
           "communes, %d %% de squelette, %d appels du proprietaire, %d decideurs). Huit gardes "
           "refusent de produire si un fait tombe, <b>y compris ceux qui verifient que l'ecart "
           "transporte l'est encore</b>. Source : " % (SOUS_ETAPES, PAIRE, COMMUNES, RATIO, APPELS,
                                                       DECIDEURS) +
           C % 'tools/gen_decoupage_1b3_pdf.py' + ".", 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=23 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker - decoupage de 1b et 3, sous-etape 1b-i',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK -> %s (%d Ko)' % (OUT, os.path.getsize(OUT) // 1024))
