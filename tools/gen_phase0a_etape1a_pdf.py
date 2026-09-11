#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/PHASE0A-ETAPE1A.pdf — le compte rendu d'EXECUTION de ft-v1193.

   Quatrieme document de la serie : DOUANE (les ecritures) -> ARCHI (le module) -> PLAN (l'ordre)
   -> CELUI-CI (ce qui a ete fait, et ce que la mesure a corrige en route).
   Michel : *« exécute la phase 0 puis l'étape 1a, avec les témoins et les critères écrits dans ce
   plan »*, puis *« pour savedFoods, ne corrige rien. Documente le bug et garde-le ouvert. »*

⭐ LES COMPTES SONT RECALCULES a chaque generation depuis le depot. Un compte rendu qui dit
   « 0 constructeur a la main » doit le VERIFIER le jour ou on l'ouvre.

⚠️ DEUX CHIFFRES NE SONT PAS RECALCULES ICI, ET C'EST DIT DANS LE DOCUMENT : l'empreinte de
   l'instantane (il faut un navigateur, ~40 s) et le decompte des mutations (8 passes de banc
   d'essai). Le document cite la sortie DATEE et nomme la commande exacte pour la rejouer.
   *Un chiffre mesure qu'on ne peut pas rejouer est un chiffre qu'il faut croire.*

⚠️ CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji. `_v` est une LISTE BLANCHE, et elle
   connait desormais les entites NOMMEES (4e trou de ce garde-fou, trouve le 11/09/2026).
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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'PHASE0A-ETAPE1A.pdf')


def lire(f):
    return open(os.path.join(ROOT, f), encoding='utf-8').read()


APP = lire('app.js').split('\n')
STATE = lire('state.js').split('\n')
RUNNER = lire('tests/parcours/runner.js')
SW = lire('sw.js')


def trouver(motif, L=None):
    L = APP if L is None else L
    return [(k + 1, l) for k, l in enumerate(L) if re.search(motif, l)]


# ─────────────────── CE QUI EST VRAI DANS LE DEPOT, MAINTENANT ───────────────────
A_LA_MAIN = len(trouver(r'^\s*_bcNutr\s*=\s*\{'))
TRAD = len([1 for _, l in trouver(r'per100:\{kcal:_bcNutr\.kcal100') if not l.strip().startswith('`')])
REF100 = len(re.findall(r'_ref100\(', '\n'.join(APP)))
PER100DE = len(re.findall(r'_per100De\(', '\n'.join(APP)))
GARDE = len(re.findall(r'garderPaquet', '\n'.join(APP)))
OUBLI = len(trouver(r'_afOublierAliment\('))
TEMOINS = len(re.findall(r"t\('CCXC ", RUNNER))
SAVED_FUSIONNE = any('savedFoods' in l for _, l in trouver(r'_fusionListe\(', STATE))
VERSION = (re.search(r"const CACHE = '(ft-v\d+)'", SW) or [None, '?'])[1]

# ⛔ GARDES : ce document decrit un ETAT. S'il n'est plus vrai, on refuse de le produire.
if A_LA_MAIN != 0:
    raise SystemExit('L\'ETAPE 1a EST DEFAITE : %d `_bcNutr={…}` ecrits a la main. Ce compte '
                     'rendu dirait faux.' % A_LA_MAIN)
if TRAD != 0:
    raise SystemExit('IL RESTE %d TRADUCTION(S) `per100:{kcal:_bcNutr.kcal100…}` — l\'etape 1a '
                     'est defaite.' % TRAD)
if REF100 < 9:
    raise SystemExit('SEULEMENT %d OCCURRENCES DE `_ref100` (8 appels + 1 declaration attendus).' % REF100)
if GARDE == 0:
    raise SystemExit('LA PHASE 0a EST DEFAITE : `garderPaquet` a disparu de app.js.')
if SAVED_FUSIONNE:
    raise SystemExit('savedFoods EST DESORMAIS FUSIONNE — or Michel a demande de le laisser '
                     'OUVERT. Ce document affirmerait le contraire de la realite.')
if TEMOINS < 14:
    raise SystemExit('SEULEMENT %d TEMOINS CCXC DANS LE RUNNER (14 attendus).' % TEMOINS)

# ⚠️ MESURES DATEES, NON RECALCULEES ICI (elles demandent un navigateur / 8 passes de banc).
SHA_INSTANTANE = 'a8065e734063ecd5'
MUTATIONS = [
    ('(1)', '`_ref100` rend `null`', '<b>RUNNER MORT</b> - mord au maximum'),
    ('(2)', '`_per100d1` retiré (tout devient brut)', '1 rouge'),
    ('(3)', '`_per100De` rend un objet VIDE', '1 rouge'),
    ('(4)', 'le poids du paquet n\'est plus effacé', '<b>3 rouges</b>'),
    ('(5)', 'la variable est propre, l\'ÉCRAN n\'est pas repeint', '2 rouges'),
    ('(6)', '`garderPaquet` ignoré (efface pour tous)', '<b>2 rouges</b>, exactement la ratatouille'),
    ('(7)', '`{normaliser:false}` ignoré', '2 rouges'),
    ('(8)', '`maxNom` ignoré (tout coupé à 60)', '1 rouge'),
]

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
                           fontSize=7.2, leading=9.0, textColor=ENCRE),
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
        # ⛔ 4e trou de ce garde-fou (11/09/2026) : il lisait les entites NUMERIQUES et pas les
        #    NOMMEES. `-&gt;` (U+2192) n'existe pas en WinAnsi -> carre noir a l'ecran.
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


def encadre(titre, corps, couleur=ROUGE):
    t = Table([[Paragraph('<b>%s</b>' % _v(titre, 'titre'), st['cellb'])],
               [Paragraph(_v(corps, 'corps'), st['cell'])]], colWidths=[165 * mm])
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
        if stringWidth(l, 'Courier', 7.2) > _LARG:
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
                      'Force Tracker — phase 0a + etape 1a executees (%s) — 11/09/2026' % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("Phase 0a + étape 1a : ce que la mesure a corrigé en route", 'titre'))
F.append(P("Force Tracker &mdash; <b>%s</b>, en ligne et vérifiée. Quatrième document de la série : "
           % VERSION + C % 'DOUANE' + " (les écritures) -&gt; " + C % 'ARCHI' + " (le module) -&gt; "
           + C % 'PLAN' + " (l'ordre) -&gt; <b>celui-ci, l'exécution</b>. "
           "Michel : <i>&laquo; exécute la phase 0 puis l'étape 1a, avec les témoins et les critères "
           "écrits dans ce plan &raquo;</i>, puis <i>&laquo; pour savedFoods, ne corrige rien. "
           "Documente le bug et garde-le ouvert. &raquo;</i>", 'sous'))

F.append(encadre(
    "L'INTÉRÊT DE CE DOCUMENT N'EST PAS LE CORRECTIF — C'EST CE QUI L'A CORRIGÉ",
    "Le code livré tient en peu de lignes. <b>Trois choses l'ont modifié pendant l'exécution, et "
    "aucune ne venait d'une relecture :</b>"
    "<br/><br/><b>1.</b> Le plan prescrivait un design &mdash; <i>&laquo; un objet qui porte les deux "
    "faces &raquo;</i> &mdash; qui <b>rendait son propre critère de réussite invérifiable</b>. La "
    "mesure l'a dit avant la première ligne."
    "<br/><b>2.</b> La passe complète a trouvé une <b>vraie régression</b> du correctif, sur un "
    "chemin sans rapport apparent."
    "<br/><b>3.</b> Ma première réparation de cette régression était <b>fausse</b>, et sa forme "
    "d'erreur est la même que celle que l'étape était censée supprimer.", ROUGE))

# ── 1. Ce qui est en ligne ──
F.append(P("1. Ce qui est en ligne, vérifié dans le dépôt à la génération", 'h1'))
F.append(tableau(
    ["ce qui était demandé", "état mesuré maintenant"],
    [["<b>Phase 0a</b> &mdash; corriger " + C % '_bcPaquetG',
      "<b>en ligne</b> &middot; " + C % 'garderPaquet' + " présent à <b>%d</b> endroits" % GARDE],
     ["… avec le témoin prévu", "<b>%d témoins</b> permanents, bloc <b>CCXC</b>" % TEMOINS],
     ["… avec la mutation prévue", "<b>8 mutations, toutes mordent</b> (détail plus bas)"],
     ["<b>" + C % 'savedFoods' + "</b> &mdash; ne rien corriger",
      "<b>0 occurrence</b> dans " + C % '_fusionListe' + " &mdash; intact"],
     ["… le documenter et le garder ouvert",
      C % 'docs/JOURNAL-DE-TEST.md' + ", état <b>ouvert</b>"],
     ["<b>Étape 1a</b> &mdash; le constructeur unique",
      "<b>%d</b> constructeur à la main &middot; <b>%d</b> traduction restante &middot; "
      "<b>%d</b> occurrences de " % (A_LA_MAIN, TRAD, REF100) + C % '_ref100' +
      " &middot; <b>%d</b> de " % PER100DE + C % '_per100De']],
    [58 * mm, 107 * mm]))

F.append(Spacer(1, 5))
F.append(bloc_code(
"""function _ref100(nom, kcal, prot, carbs, fat, opts){
  const n = (opts && opts.normaliser===false) ? (x=>+x||0) : _per100d1;
  return { name:String(nom==null?'':nom).slice(0, (opts && opts.maxNom) || 60),
           kcal100:n(kcal), prot100:n(prot), carbs100:n(carbs), fat100:n(fat) };
}
function _per100De(r){
  return r ? {kcal:r.kcal100, prot:r.prot100, carbs:r.carbs100, fat:r.fat100} : null;
}""",
    "Le code livré, extrait du dépôt. Il remplace <b>8</b> constructions écrites à la main et "
    "<b>4</b> lignes de traduction identiques au caractère près."))

F.append(Spacer(1, 5))
F.append(encadre(
    "C'EST UNE EXTRACTION, PAS UNE UNIFORMISATION — et c'est tout le contrat",
    "<b>2 portes sur 8 n'arrondissent pas</b> : les <i>reprises</i> (&laquo; Mes aliments &raquo; et "
    "la recherche dans le journal), qui recopient un pour-100&nbsp;g <b>déjà stocké</b>. Leur faire "
    "traverser " + C % '_per100d1' + " changerait une <b>valeur enregistrée</b> : ce serait une "
    "<b>DÉCISION</b>, pas un rangement. D'où " + C % '{normaliser:false}' + "."
    "<br/><br/><i>On extrait ce qui existe, on ne redresse rien au passage.</i> Le même raisonnement "
    "vaut pour " + C % 'maxNom' + " : les portes ne coupent pas toutes le nom pareil (60 partout, "
    "<b>80</b> pour l'étiquette recopiée à la main). Cet écart est <b>transporté tel quel</b>, pas "
    "harmonisé &mdash; sinon l'instantané bougerait, et on ne saurait plus rien.", VERT))

# ── 2. Le critère ──
F.append(PageBreak())
F.append(P("2. Le critère était binaire, et il est atteint", 'h1'))
F.append(P("Le plan exigeait : <i>&laquo; aucune valeur attendue modifiée &raquo;</i>. "
           "<b>Une passe verte ne prouve pas ça</b> &mdash; elle prouve que ce que les témoins "
           "<b>regardent</b> n'a pas bougé. D'où un instantané dédié (" + C % 'tools/instantane_ref100.js' +
           ") qui sérialise la sortie <b>brute</b> des 8 portes, avant et après."))
F.append(bloc_code(
"""node tools/instantane_ref100.js > /tmp/avant.json     # avant de toucher au code
node tools/instantane_ref100.js > /tmp/apres.json     # apres
diff /tmp/avant.json /tmp/apres.json                  # -> vide

resultat mesure le 11/09/2026 : IDENTIQUE octet pour octet
  2920 octets / 2920 octets      sha256 (16 premiers) : %s""" % SHA_INSTANTANE,
    "<b>/!\</b> Cette empreinte est une <b>sortie datée</b>, pas un chiffre recalculé à la génération de ce "
    "PDF : l'instantané demande un navigateur (~40 s). La commande exacte est donnée pour qu'on "
    "puisse la rejouer."))

F.append(Spacer(1, 5))
F.append(encadre(
    "LE PLAN PRESCRIVAIT UN DESIGN QUI RENDAIT SON PROPRE CRITÈRE INVÉRIFIABLE",
    "Le plan disait : <i>&laquo; " + C % '_ref100()' + " rend un objet qui porte les deux faces &raquo;</i> "
    "&mdash; " + C % 'kcal100…' + " pour les lecteurs actuels <b>et</b> " + C % 'per100' + " pour la "
    "provenance. Élégant sur le papier."
    "<br/><br/><b>NON</b> <b>Mais poser</b> " + C % 'per100' + " <b>DANS</b> " + C % '_bcNutr' + " <b>aurait "
    "ajouté un champ à l'objet que l'instantané sérialise.</b> Le critère (<i>identique octet pour "
    "octet</i>) aurait été violé <b>par construction</b> : impossible de distinguer &laquo; rien n'a "
    "changé &raquo; de &laquo; tout a changé un peu &raquo;."
    "<br/><br/><b>Deux petites fonctions au lieu d'une maligne.</b> "
    "<i>Un critère qu'on est obligé d'assouplir pour faire passer son propre code n'est plus un "
    "critère.</i>", ORANGE))

# ── 3. La régression ──
F.append(P("3. La passe a trouvé une vraie régression &mdash; sur un chemin sans rapport", 'h1'))
F.append(P("Deux témoins de <b>ft-v1174</b> (bloc CCLXXII (8) et (9)) sont devenus rouges : une "
           "ratatouille <b>trouvée mais sans valeurs</b> perdait son &laquo; 250 g &raquo; en partant "
           "au calibrage. Or le correctif de la phase 0a ne parle <b>ni de calibrage ni de "
           "ratatouille</b>."))
F.append(bloc_code(
"""avant : _afOublierAliment ne nettoyait PAS _bcPaquetG
        -> _bcPaquetTxt traversait le chemin du calibrage
        -> parce que PERSONNE ne la nettoyait, pas parce qu'on l'avait voulu

apres : le menage est fait -> la variable est effacee -> le 250 g disparait"""))
F.append(Spacer(1, 4))
F.append(encadre(
    "NOUVELLE FAMILLE — BUGS.md §62",
    "<b>Une protection qui ne tenait que par l'absence de ménage.</b>"
    "<br/><br/><i>Le jour où l'on range enfin, on découvre ce qui ne tenait que par le désordre.</i>"
    "<br/><br/><b>Ce qui l'attrape</b> : la passe complète, et elle seule. Ni la relecture, ni le "
    "contrôle négatif du correctif (qui mordait parfaitement sur <b>ses</b> témoins), ni l'instantané "
    "avant/après &mdash; identique octet pour octet, parce que le chemin cassé <b>n'y figurait pas</b>."
    "<br/><br/><b>Le réflexe</b> : après un correctif qui <b>nettoie</b> un état partagé, chercher "
    "<b>qui comptait sur le fait qu'il ne soit PAS nettoyé</b>.", ROUGE))

# ── 4. La mauvaise réparation ──
F.append(P("4. Et ma première réparation était fausse &mdash; sa forme vaut plus que le correctif", 'h1'))
F.append(P("J'ai recopié le patron <i>&laquo; on prend, on oublie, on repose &raquo;</i> chez "
           + C % '_lookupBarcode' + ", puis chez " + C % '_calAppliquer' + ". <b>Le témoin est resté "
           "rouge</b> : il existe une <b>TROISIÈME</b> porte sur ce chemin, " + C % '_bcSansValeurs' + "."))
F.append(Spacer(1, 3))
F.append(encadre(
    "R8, LA PORTE JUMELLE — À L'INTÉRIEUR DU CORRECTIF CENSÉ FERMER UNE FUITE",
    "<i><b>Un patron qu'on recopie à chaque porte EST la duplication qu'on prétend supprimer.</b></i>"
    "<br/><br/><b>Le bon geste</b> : un <b>paramètre nommé sur le propriétaire unique</b> &mdash; "
    + C % '_afOublierAliment({garderPaquet:true})' + " &mdash; qui dit <b>une seule fois</b> la "
    "distinction entre <i>&laquo; j'oublie l'aliment &raquo;</i> et <i>&laquo; je remets l'écran à "
    "plat pour le MÊME aliment &raquo;</i>. <b>2 appelants sur %d</b> sont dans le second cas."
    % OUBLI, ORANGE))

# ── 5. Le contrôle négatif ──
F.append(PageBreak())
F.append(P("5. Le contrôle négatif : 8 mutations, toutes mordent", 'h1'))
F.append(tableau(["#", "ce qu'on casse exprès", "ce que le banc répond"],
                 [[a, b, c] for a, b, c in MUTATIONS], [8 * mm, 90 * mm, 67 * mm]))
F.append(Spacer(1, 5))
F.append(encadre(
    "ET LE HARNAIS DE MUTATION M'A MENTI — MÊME FAMILLE QUE §61",
    "La mutation (1) affichait <b>&laquo; 0 rouges &raquo;</b>. Je l'ai lue comme <i>&laquo; elle ne "
    "mord pas &raquo;</i> &mdash; donc comme la preuve que le code muté était <b>décoratif</b>."
    "<br/><br/>En regardant la sortie <b>complète</b> : le runner <b>plantait</b> (" + C % 'TypeError' +
    " sur " + C % 'null' + "), donc il n'affichait <b>rien</b>, et mon " + C % 'grep -c' + " comptait "
    "0 sur une sortie <b>vide</b>."
    "<br/><br/><i><b>Un compteur de rouges doit d'abord vérifier que le runner a FINI.</b> &laquo; 0 "
    "rouge &raquo; et &laquo; n'a pas tourné &raquo; produisent le même chiffre.</i>"
    "<br/><br/><b>/!\</b> Et deux autres formes de la même famille le même jour : un témoin qui comptait "
    "<b>le commentaire citant le motif supprimé</b> ; et " + C % 'pgrep -f "node tests/…"' + " qui "
    "<b>matche son propre shell</b>, d'où une attente infinie sur une passe déjà terminée.", ROUGE))

F.append(Spacer(1, 5))
F.append(P("<b>*</b> Et un témoin plus ancien a fait son travail contre moi", 'h2'))
F.append(P("Le contrôle <i>&laquo; les constructions de " + C % '_bcNutr' + " sont bien trouvées &raquo;</i> "
           "a rougi &mdash; parce que son voisin (<i>&laquo; aucune construction ne ré-arrondit &raquo;</i>) "
           "était passé <b>VERT sur une liste VIDE</b>. Sans lui, l'étape 1a aurait transformé une "
           "vraie garantie en vert décoratif, <b>en silence</b>. Réécrit sur le propriétaire unique : "
           "<b>la garantie ne s'affaiblit pas, elle se déplace</b>."))

# ── 6. Laissé ouvert ──
F.append(P("6. Deux points mesurés et volontairement NON corrigés", 'h1'))
F.append(P("<b>(1) " + C % 'S.savedFoods' + " se perd entre deux onglets</b> &mdash; décision de "
           "Michel : <i>&laquo; ne corrige rien pour l'instant, je ne veux pas d'une rustine qui "
           "ressuscite des favoris supprimés &raquo;</i>.", 'h2'))
F.append(bloc_code(
"""onglet A ecrit « Pain »                      -> disque : ["Pain"]
onglet B (liste perimee) ecrit « Fromage »   -> disque : ["Fromage"]   <- Pain perdu
TEMOIN foodLog, exactement le meme scenario  -> ["Fromage","Pain"]     <- garde"""))
F.append(Spacer(1, 4))
F.append(P("<b>NON</b> <b>Et l'ajouter à " + C % '_fusionListe' + " serait FAUX</b> : la fusion fait une "
           "<b>union par clé</b>. Les 5 listes qu'elle protège sont des <b>journaux qui ne font "
           "qu'AJOUTER</b> ; <b>les favoris se SUPPRIMENT</b>. <i>Une fusion par union sur une liste "
           "où l'on retire n'est pas une protection, c'est une résurrection.</i> Il faut un "
           "horodatage ou une pierre tombale &mdash; <b>décision produit, pas rustine</b>."))
F.append(Spacer(1, 4))
F.append(P("<b>(2) Le scan rend " + C % '48,3' + ", la recherche par nom rend " + C % '48' +
           "</b> &mdash; sur la <b>même fiche</b>.", 'h2'))
F.append(P("Trouvé <b>par l'instantané</b>, alors que personne ne le cherchait : " + C % '_afSuggKcal100' +
           " réécrit la formule de " + C % '_lookupBarcode' + " (" + C % 'energy-kcal_100g || energy_100g/4.184' +
           ") <b>avec</b> " + C % 'Math.round' + " au lieu de " + C % '_per100d1' + ". 9e occurrence de "
           "la famille " + C % 'BUGS.md' + " &sect;59. "
           "<b>NON</b> <b>Non corrigé exprès</b> : corriger changerait une <b>valeur enregistrée</b>, donc ce "
           "ne serait plus une extraction. <i>Et c'est cette promesse qui rend l'instantané lisible.</i>"))

F.append(Spacer(1, 6))
F.append(encadre(
    "ÉTAT DES TESTS ET DU DÉPLOIEMENT",
    "<b>Parcours 3549/3549</b> sur l'arbre final (+14, bloc CCXC) &middot; calculs 339/339 &middot; "
    "muscles 241/241 &middot; croisés 50/50 &middot; dates 9/9 &middot; données classées 0 trou."
    "<br/><b>OK</b> <b>Déploiement vérifié</b> : run #1087, job " + C % 'success' + ", 5 étapes vertes, "
    "terminé à <b>20:49:12 UTC</b>."
    "<br/><br/><b>/!\</b> <b>Une limite dite</b> : l'API a affiché le <b>run</b> en " + C % 'in_progress' +
    " alors que son <b>job</b> était terminé depuis plusieurs minutes &mdash; un état périmé, pas un "
    "blocage. <i>Ce n'est pas UNE requête qui est fiable, c'est d'en croiser DEUX.</i> Et le proxy de "
    "ce conteneur refuse " + C % 'github.io' + " : <b>l'app affichant %s reste à confirmer sur "
    "iPhone.</b>" % VERSION, VERT))

F.append(Spacer(1, 6))
F.append(encadre(
    "CE QUE CE DOCUMENT N'EST PAS",
    "Les compteurs de la page 1 sont <b>recalculés à chaque génération</b> depuis le dépôt, et le "
    "générateur <b>refuse de produire</b> si l'un d'eux redevient faux &mdash; notamment si "
    + C % 'savedFoods' + " était fusionné, puisque Michel a demandé de le laisser <b>ouvert</b>."
    "<br/><br/><b>/!\</b> En revanche, <b>l'empreinte de l'instantané et le décompte des mutations ne sont "
    "pas recalculés ici</b> (navigateur, 8 passes de banc). Le document cite des sorties <b>datées</b> "
    "et nomme les commandes pour les rejouer. <i>Un chiffre mesuré qu'on ne peut pas rejouer est un "
    "chiffre qu'il faut croire.</i>"
    "<br/><br/><b>SUITE</b> <b>Suite du plan</b> : étapes 1b, 2 et 3 (extractions, même critère d'instantané), "
    "puis le hub (phase 2), puis la douane en mode observateur (phase 3).", GRIS))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker — phase 0a + etape 1a executees',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
print('   mesure : %d a la main · %d traduction · %d _ref100 · %d _per100De · %d garderPaquet · '
      '%d appelants de _afOublierAliment · %d temoins CCXC · savedFoods fusionne : %s · %s'
      % (A_LA_MAIN, TRAD, REF100, PER100DE, GARDE, OUBLI, TEMOINS, SAVED_FUSIONNE, VERSION))
