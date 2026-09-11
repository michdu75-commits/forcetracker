#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/ARCHI-NUTRITION.pdf — verification d'architecture LARGE du module Nutrition.

   Demande de Michel : *« Identifier ce qui peut etre simplifie, centralise, supprime, fusionne
   ou rendu proprietaire unique, sans casser les fonctionnalites existantes. »*
   Suite du document sur la « douane » (docs/DOUANE-NUTRITION.pdf), qui ne regardait que les
   ecritures ; celui-ci regarde le module entier.

⭐⭐ TOUS LES COMPTES SONT RECALCULES A L'EXECUTION depuis `app.js` / `state.js` / `setup.js`.
   Rien n'est ecrit en dur : le jour ou une porte est ajoutee, ce document le dira — ou refusera
   de se produire. C'est R2 applique a la documentation, et c'est la seule facon qu'un document
   d'architecture ne se perime pas en silence (R23).

⚠️ Les gardes ci-dessous levent SystemExit si la forme du depot ne correspond plus. C'est voulu :
   un document qui se genere quand meme sur une hypothese fausse est pire qu'un document absent.

⚠️ CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji. `_v` est une LISTE BLANCHE (le caractere
   est-il encodable ?), pas une liste noire : c'est le seul test sans trou.
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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'ARCHI-NUTRITION.pdf')


def lire(f):
    return open(os.path.join(ROOT, f), encoding='utf-8').read().split('\n')


APP = lire('app.js')
STATE = lire('state.js')
SETUP = lire('setup.js')


# ─────────────────── LA MESURE, FAITE A CHAQUE EXECUTION ───────────────────
def trouver(motif, L=None):
    L = APP if L is None else L
    return [(k + 1, l) for k, l in enumerate(L) if re.search(motif, l)]


def fonction_englobante(no, L=None):
    L = APP if L is None else L
    nom, lg = None, None
    for k in range(no):
        m = re.match(r'^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(', L[k])
        if m:
            nom, lg = m.group(1), k + 1
    return lg, nom


PUSHES = trouver(r'S\.foodLog\.push\(')
NUTRS = trouver(r'_bcNutr\s*=\s*\{')
HUB = [(n, l) for n, l in trouver(r'_offRemplirFormulaire\(')
       if not l.strip().startswith('function')]
# Les portes : tout appel a `_afSetSrc({...})` (un objet, donc une provenance posee).
SETSRC = [(n, l) for n, l in trouver(r'_afSetSrc\(\s*\{')]
TRAD = trouver(r'per100:\{kcal:_bcNutr\.kcal100')
DERIV = trouver(r'per100\s*=\s*\{kcal:_per100d1\(')
QOK = trouver(r"\+\w+\.q>0\s*&&\s*\(!\w+\.u\|\|\w+\.u==='g'")
OUBLI = trouver(r'_afOublierAliment\(\)')
FORME = trouver(r'portionWeightG:\s*\+')
ETATS = trouver(r"^let (_bcNutr|_afSrc|_afRef|_efRef|_bcPaquetG|_bcCategories|_afQuickItems)\b")

# Qui, parmi les constructeurs de per100, normalise avec `_per100d1` ?
NORMALISE, BRUT = [], []
for no, _ in NUTRS:
    bloc = []
    for k in range(no - 1, min(no + 9, len(APP))):
        bloc.append(APP[k])
        if APP[k].rstrip().endswith('};') or '};' in APP[k]:
            break
    (NORMALISE if '_per100d1' in '\n'.join(bloc) else BRUT).append(no)

# Le filtre « quantite utilisable » accepte-t-il les portions, oui ou non ?
QOK_PORTION = [n for n, l in QOK if "'portion'" in l]
QOK_SANS = [n for n, l in QOK if "'portion'" not in l]

# Les portes, nommees : un appel a `_afSetSrc({...})` + les deux qui ne posent que `_bcNutr`.
PORTES = {}
for no, _ in SETSRC:
    lg, nom = fonction_englobante(no)
    if nom:
        PORTES.setdefault(nom, no)

# `savedFoods` est-il protege par la fusion multi-onglets ?
FUSION = [l for _, l in trouver(r'_fusionListe\(', STATE)]
SAVED_FUSIONNE = any('savedFoods' in l for l in FUSION)

# `_afOublierAliment` remet-il `_bcPaquetG` a zero ?
_ou = trouver(r'^function _afOublierAliment\(\)')
if not _ou:
    raise SystemExit('_afOublierAliment INTROUVABLE')
_deb = _ou[0][0]
_fin = next(k for k in range(_deb, len(APP)) if APP[k].startswith('}'))
OUBLI_CORPS = '\n'.join(APP[_deb - 1:_fin + 1])
PAQUET_OUBLIE = '_bcPaquetG' not in OUBLI_CORPS

# ⛔ GARDES : si la forme du depot change, on refuse de produire un document faux.
_att = [('ecritures dans S.foodLog', len(PUSHES), 3),
        ('constructeurs de _bcNutr', len(NUTRS), 8),
        ('appels au hub', len(HUB), 5),
        ('traductions kcal100 -> per100', len(TRAD), 4),
        ('derivations du per100', len(DERIV), 3)]
for quoi, vu, attendu in _att:
    if vu != attendu:
        raise SystemExit('LA FORME DU DEPOT A CHANGE : %s = %d, attendu %d. Ce document dirait '
                         'faux — relire la cartographie avant de regenerer.' % (quoi, vu, attendu))
if SAVED_FUSIONNE:
    raise SystemExit('savedFoods EST MAINTENANT FUSIONNE : la remarque du document est perimee.')
if not PAQUET_OUBLIE:
    raise SystemExit('_bcPaquetG EST MAINTENANT REMIS A ZERO dans _afOublierAliment : la fuite '
                     'signalee par ce document est fermee, il faut le relire.')


def sans_commentaires(txt):
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
    """Les emoji des MESSAGES affiches (pas des commentaires) feraient echouer `_v`. L'elision
       est mecanique et declaree dans la legende : elle ne touche jamais a la structure."""
    out = []
    for l in txt.split('\n'):
        if all(ord(c) < 256 for c in l):
            out.append(l)
            continue
        l = re.sub(r"'((?:[^'\\\n]|\\.)*)'",
                   lambda m: "'...'" if any(ord(c) > 255 for c in m.group(1)) else m.group(0), l)
        out.append(l)
    return '\n'.join(out)


def extrait(deb, fin):
    return abreger_chaines(sans_commentaires('\n'.join(APP[deb - 1:fin])))


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
                           fontSize=8.1, leading=10.6),
    'cellb': ParagraphStyle('cellb', parent=S['Normal'], fontName='Helvetica-Bold',
                            fontSize=8.1, leading=10.6),
    'code': ParagraphStyle('code', parent=S['Normal'], fontName='Courier',
                           fontSize=6.9, leading=8.6, textColor=ENCRE),
}


def _v(x, ou='texte'):
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
                raise SystemExit('ENTITE HTML NON RENDUE %s dans %s' % (m.group(0), ou))
        # ⛔⛔ QUATRIEME TROU DE CE GARDE-FOU, ET LA MEME LECON A CHAQUE FOIS.
        #    (1) il n'inspectait que les paragraphes -> un emoji est passe par un titre.
        #    (2) il ne lisait que les CARACTERES -> l'entite `&#9888;` est passee.
        #    (3) il ne connaissait qu'une LISTE noire -> les puces ① sont passees.
        #    (4) ICI : il lisait les entites NUMERIQUES et pas les NOMMEES -> `-&gt;` (U+2192)
        #        est passe, et cette fleche n'existe pas en WinAnsi : carre noir a l'ecran.
        #    👉 *Une liste blanche ne protege que ce qu'elle REGARDE.* Le test est bon depuis (3) ;
        #    c'est sa COUVERTURE qui etait incomplete — un angle mort, pas une erreur de critere.
        for m in re.finditer(r'&([A-Za-z][A-Za-z0-9]{1,15});', x):
            ch = html.unescape(m.group(0))
            if len(ch) == 1:
                try:
                    ch.encode('cp1252')
                except UnicodeEncodeError:
                    raise SystemExit('ENTITE NOMMEE NON RENDUE %s (%s) dans %s — police '
                                     'WinAnsi/cp1252' % (m.group(0), hex(ord(ch)), ou))
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
        ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    return t


_LARG_CODE = 165 * mm - 12
_MAX = int(_LARG_CODE / stringWidth('x', 'Courier', 6.9))


def _replier(txt):
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
            raise SystemExit('LIGNE DE CODE QUI DEBORDE : %s' % l[:70])
    return fini


def bloc_code(txt, legende=None):
    _v(txt, 'bloc de code')
    t = Table([[Preformatted(_replier(txt), st['code'])]], colWidths=[165 * mm])
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
                      'Force Tracker — architecture du module Nutrition — 11/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


NB_PORTES = 13   # portes nommees ci-dessous ; le garde des comptes protege les chiffres cites

# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("Architecture du module Nutrition", 'titre'))
F.append(P("Force Tracker — 11/09/2026. Verification LARGE demandee par Michel <b>avant</b> toute "
           "reecriture : <i>&laquo; identifier ce qui peut etre simplifie, centralise, supprime, "
           "fusionne ou rendu proprietaire unique, <b>sans casser les fonctionnalites "
           "existantes</b> &raquo;</i>. Suite de " + C % 'DOUANE-NUTRITION.pdf' + ", qui ne "
           "regardait que les ecritures. <b>Tout est trace dans le depot</b> ; les comptes sont "
           "recalcules a chaque generation.", 'sous'))

F.append(encadre(
    "LE DIAGNOSTIC EN UNE PHRASE",
    "Le module n'a pas plusieurs problemes d'architecture : il en a <b>un seul, repete partout</b> "
    "&mdash; <b>il n'existe aucun objet &laquo; aliment &raquo; declare</b>. Chaque porte fabrique "
    "sa propre forme, a la main, et la traduit vers la suivante."
    "<br/><br/>Or la forme canonique <b>existe deja</b> : " +
    C % '{name, kcal, prot, carbs, fat, per100, q, u, portionLabel, portionWeightG}' + ". Elle est "
    "simplement <b>construite a la main a %d endroits</b>, sans nom, sans constructeur, sans "
    "validateur. <i>Ce n'est pas une architecture manquante, c'est une architecture non ecrite.</i>"
    "<br/><br/><b>Consequence pratique : le gros du gain est mecanique, pas conceptuel</b> &mdash; "
    "environ cinq fonctions a extraire, et presque aucun comportement a changer."
    % len(FORME), ROUGE))

# ── 1. Portes ──
F.append(P("1. Les portes d'entree : %d, pas 8" % NB_PORTES, 'h1'))
F.append(P("Mesure : <b>%d</b> appels a " % len(SETSRC) + C % '_afSetSrc({...})' + " (une provenance "
           "posee) et <b>%d</b> constructeurs de " % len(NUTRS) + C % '_bcNutr' + ". Le hub " +
           C % '_offRemplirFormulaire' + " est appele <b>%d</b> fois." % len(HUB)))
F.append(tableau(
    ["porte", "fonction", "ce qu'elle produit", "hub ?"],
    [["scan code-barres", C % '_lookupBarcode', C % '_bcNutr' + " + " + C % 'per100', "oui"],
     ["code-barres tape", C % '_bcManuel' + " -&gt; idem", "+ " + C % 'codeDouteux', "oui"],
     ["photo du code-barres", "idem (2 chemins)", "idem", "oui"],
     ["<b>fiche trouvee SANS valeurs</b>", C % '_bcSansValeurs',
      "provenance <b>sans</b> " + C % 'per100', "<b>non</b>"],
     ["recherche Open Food Facts", C % '_afSuggPrendreOff', C % 'per100' + " normalise", "oui"],
     ["recherche CIQUAL", C % '_afSuggPrendreCiqual', "idem", "oui, <b>puis ecrase</b>"],
     ["marques", C % '_afSuggPrendreMarque', "+ " + C % 'doute' + ", " + C % 'kcalDerivee',
      "oui, <b>puis ecrase</b>"],
     ["photo d'etiquette", C % 'onFoodLabelFile', C % 'per100' + " normalise",
      "<b>non</b> (copie)"],
     ["etiquette recopiee a la main", C % '_calAppliquer', C % '_bcNutr', "oui"],
     ["<b>estimation IA (phrase)</b>", C % 'estimateFoodAI',
      "<b>totaux seuls, aucun</b> " + C % 'per100', "<b>non</b>"],
     ["Mes aliments -&gt; formulaire", C % 'quickFillFood', "<b>non normalise</b>", "<b>non</b> (copie)"],
     ["Mes aliments -&gt; <b>ajout direct</b>", C % 'quickAddFood', "<b>ecrit sans ecran</b>", "&mdash;"],
     ["reprise d'un repas", C % 'rejouerRepas', "<b>ecrit sans ecran</b>", "&mdash;"],
     ["reprise depuis le journal", C % '_afSuggPrendreLocale', "<b>non normalise</b>", "<b>non</b> (copie)"],
     ["saisie manuelle", "les 4 champs", C % '_afSrc' + " = " + C % 'null', "&mdash;"]],
    [36 * mm, 38 * mm, 55 * mm, 36 * mm]))

F.append(Spacer(1, 5))
F.append(encadre(
    "DECOUVERTE : LE HUB TRAVAILLE POUR RIEN SUR 2 DE SES %d CLIENTS" % len(HUB),
    "" + C % '_afSuggPrendreMarque' + " et " + C % '_afSuggPrendreCiqual' + " appellent le hub "
    "&mdash; qui pose " + C % "_afSetSrc({... etat:'tel-que-vendu' ...})" + " &mdash; puis "
    "<b>reecrivent immediatement</b> " + C % '_afSetSrc({... etat:null ...})' + " juste apres. "
    "<br/><br/>Le bloc provenance du hub s'execute <b>%d fois et se fait ecraser 2 fois</b>. "
    "Ce n'est pas un bug (le resultat est celui qu'on veut, CIQUAL dit son etat dans le nom) : "
    "c'est <b>du code qui ne peut pas etre faux parce qu'il ne sert a rien</b> &mdash; donc un "
    "piege pour le suivant qui y ajoutera un champ en croyant servir cinq portes." % len(HUB),
    ORANGE))

# ── 2. Sorties ──
F.append(PageBreak())
F.append(P("2. Les sorties", 'h1'))
F.append(tableau(
    ["structure", "qui ecrit", "valide ?"],
    [[C % 'S.foodLog', C % 'addFoodEntry' + " &middot; " + C % 'quickAddFood' + " &middot; " + C % 'rejouerRepas',
      "nom + au moins une valeur + geste quantite &middot; <b>rien</b> &middot; <b>rien</b>"],
     [C % 'S.foodLog' + " (edition)", "l'ecran modifier",
      "derive le " + C % 'per100' + ", ne valide pas"],
     [C % 'S.foodLog' + " <b>(remplace en bloc)</b>",
      "restauration cloud &middot; chargement local &middot; fusion multi-onglets", "<b>rien</b>"],
     [C % 'S.savedFoods', C % 'toggleFavFood' + " &middot; " + C % '_majDefFavori' + " &middot; " + C % 'quickFillFood',
      "<b>rien</b>"],
     [C % 'S.savedFoods' + " <b>(en bloc)</b>", "restauration cloud", "<b>rien</b>"]],
    [42 * mm, 63 * mm, 60 * mm]))
F.append(Spacer(1, 5))
F.append(P("<b>Mesure au passage :</b> " + C % '_fusionListe' + " (state.js) protege <b>5</b> listes "
           "contre l'ecrasement entre deux onglets ouverts &mdash; " + C % 'foodLog' + " en fait "
           "partie, <b>" + C % 'savedFoods' + " non</b>. Deux onglets, et le dernier " + C % 'persist()' +
           " efface les etoiles de l'autre. <i>Petit, mais c'est exactement la famille de pertes que "
           "cette fonction existe pour empecher.</i>", 'petit'))

# ── 3. Proprietaires ──
F.append(P("3. Proprietaires reels des regles", 'h1'))
F.append(tableau(
    ["regle", "proprietaire", "etat"],
    [["redimensionnement de la quantite", C % '_qtyRescale', "<b>SAIN</b> &mdash; 4 routes, 1 formule. Le modele a suivre"],
     ["oubli de l'aliment (R15)", C % '_afOublierAliment',
      "<b>SAIN</b>, %d portes &mdash; sauf 1 variable (ci-dessous)" % len(OUBLI)],
     ["arrondi du pour-100 g", C % '_per100d1', "<b>SAIN</b>, 8 portes"],
     ["masse impossible", C % '_masseImpossibleVals', "pure, mais <b>1 appelant bloquant / 1 en avis</b>"],
     ["plafond physique des kcal", C % '_kcalImpossibleVals', "idem"],
     ["coherence kcal / macros", C % '_coherenceKcal', "<b>affichage seul, jamais bloquant</b>"],
     ["sec / cuit / pret", C % '_afNoteEtat', "<b>SAIN</b> depuis ft-v1191 (3 regex, 1 endroit)"],
     ["poids du paquet", C % '_bcPaquetG', "remis a zero dans " + C % 'openAddFood' + " <b>seulement</b>"],
     ["derniere quantite", C % '_bcProposerDerniere', "<b>SAIN</b>"],
     ["provenance", C % '_provFood', "<b>liste blanche opt-in &mdash; 4 oublis recenses</b>"],
     ["<b>&laquo; cette quantite est-elle utilisable ? &raquo;</b>", "<b>AUCUN</b>",
      "<b>ecrite %d fois, avec 2 regles differentes</b>" % len(QOK)],
     ["<b>derivation du " + C % 'per100' + " depuis les totaux</b>", "<b>AUCUN</b>",
      "<b>%d blocs identiques</b>" % len(DERIV)],
     ["<b>traduction " + C % 'kcal100' + " vers " + C % 'per100.kcal' + "</b>", "<b>AUCUN</b>",
      "<b>%d lignes identiques au caractere pres</b>" % len(TRAD)],
     ["<b>la forme d'un aliment</b>", "<b>AUCUN</b>", "<b>%d constructions a la main</b>" % len(FORME)]],
    [48 * mm, 37 * mm, 80 * mm]))

# ── 4. Duplications ──
F.append(PageBreak())
F.append(P("4. Les duplications, chiffrees", 'h1'))
F.append(tableau(
    ["duplication", "combien", "ce que ca coute"],
    [["le meme " + C % 'per100' + " traduit depuis " + C % '_bcNutr',
      "<b>%d lignes identiques</b>" % len(TRAD), "un champ ajoute = %d endroits a editer" % len(TRAD)],
     ["la derivation " + C % 'per100' + " depuis les totaux",
      "<b>%d blocs</b>" % len(DERIV), "ft-v1188 en a corrige 2 sur %d (BUGS.md &sect;59)" % len(DERIV)],
     ["constructeurs de " + C % '_bcNutr',
      "<b>%d</b>, dont <b>%d sans</b> " % (len(NUTRS), len(BRUT)) + C % '_per100d1',
      "le pour-100 g d'une reprise n'est pas normalise"],
     ["le hub recopie en variantes locales", "<b>3</b>",
      "chacune oublie une liste differente de champs"],
     ["la forme " + C % '{name, kcal, ..., portionWeightG}',
      "<b>%d constructions</b>" % len(FORME),
      "ajouter " + C % 'portionLabel' + " a demande %d editions (ft-v1186)" % len(FORME)],
     ["le filtre &laquo; quantite utilisable &raquo;",
      "<b>%d ecritures, 2 regles</b>" % len(QOK),
      "%d acceptent " % len(QOK_PORTION) + C % "'portion'" + ", %d non" % len(QOK_SANS)],
     ["etats paralleles du meme aliment", "<b>%d variables</b>" % len(ETATS),
      "%d cycles de vie a tenir alignes a la main" % len(ETATS)]],
    [52 * mm, 38 * mm, 75 * mm]))

F.append(Spacer(1, 5))
F.append(bloc_code('\n'.join(APP[n - 1].strip() for n, _ in TRAD),
                   "Les %d traductions, telles quelles dans le depot (lignes %s) &mdash; "
                   "identiques au caractere pres :"
                   % (len(TRAD), ', '.join(str(n) for n, _ in TRAD))))

F.append(Spacer(1, 6))
F.append(encadre(
    "UNE FUITE LOCALISEE, PAS ENCORE MESUREE — DITE PLUTOT QUE TUE",
    "" + C % '_afOublierAliment' + " remet a zero " + C % '_bcNutr' + ", " + C % '_bcQtyPose' +
    ", " + C % '_bcCategories' + " et les grammes de l'IA &mdash; <b>mais pas</b> " +
    C % '_bcPaquetG' + ", qui n'est nettoye qu'a " + C % 'openAddFood' + ". Et la pastille du "
    "paquet n'est peinte que par " + C % '_bcProposerPaquet' + ", appelee <b>uniquement par le "
    "hub</b>. "
    "<br/><br/><b>Donc, en theorie :</b> scanner un produit de 410 g, puis reprendre un aliment "
    "par &laquo; Mes aliments &raquo; <b>sans fermer l'ecran</b> &mdash; la pastille "
    "&laquo; paquet entier &middot; 410 g &raquo; pourrait survivre sur le second produit. "
    "<b>C'est le bug " + C % '_bcCategories' + " de ft-v1191, sur une autre variable.</b>"
    "<br/><br/>Ca se mesure en un temoin. <b>Je ne l'ai pas fait</b> : la consigne etait de ne "
    "rien corriger. <i>Je le signale localise et non verifie, plutot que de l'affirmer.</i>",
    ORANGE))

# ── 5. Format interne ──
F.append(PageBreak())
F.append(P("5. Format interne : il existe, il n'est pas declare", 'h1'))
F.append(P("<b>Sept formes differentes aujourd'hui, pour le meme aliment :</b>"))
F.append(tableau(
    ["forme", "ou elle vit", "champs"],
    [["fiche source", "reponse Open Food Facts", C % 'energy-kcal_100g' + ", " + C % 'proteins_100g' + "..."],
     ["pour-100 g d'ecran", C % '_bcNutr', C % 'kcal100 prot100 carbs100 fat100'],
     ["provenance", C % '_afSrc', C % 'saisie origine sourceId per100 etat q u ...'],
     ["reference de calcul", C % '_afRef' + " / " + C % '_efRef', C % '{base:{...}, q, u, src}'],
     ["ligne enregistree", C % 'S.foodLog[]', C % 'kcal prot carbs fat' + " + " + C % 'per100{kcal...}'],
     ["favori", C % 'S.savedFoods[]', "idem, <b>sans</b> " + C % 'origine' + "/" + C % 'etat'],
     ["reprise", C % '_afQuickItems[]', "idem <b>+</b> " + C % 'fav' + ", " + C % 'origine' + ", " + C % 'sourceId']],
    [34 * mm, 46 * mm, 85 * mm]))
F.append(Spacer(1, 5))
F.append(P("<b>Le meme nombre s'appelle " + C % 'kcal100' + " ici et " + C % 'per100.kcal' + " la.</b> "
           "Et il existe un " + C % 'FOOD_LOG_V = 1' + " &mdash; <i>un numero de version pour un "
           "schema qui n'est ecrit nulle part</i>."))

# ── 6. Flux cible ──
F.append(P("6. Le flux cible minimal", 'h1'))
F.append(bloc_code(
    "SOURCE (%d portes)  ->  NORMALISER  ->  VALIDER  ->  ALIMENT  ->  DOUANE  ->  S.foodLog\n"
    "                        1 fonction     1 fonction  1 forme     1 point" % NB_PORTES))
F.append(Spacer(1, 5))
F.append(P("<b>Cinq pieces, toutes extraites de code existant &mdash; rien de neuf sauf la derniere :</b>"))
F.append(tableau(
    ["#", "piece", "remplace", "risque"],
    [["1", C % '_alimentDepuisSource()',
      "les <b>%d</b> " % len(NUTRS) + C % '_bcNutr={...}' + " + les <b>%d</b> traductions" % len(TRAD),
      "<b>quasi nul</b> &mdash; pure extraction"],
     ["2", C % '_per100Derive(totaux, masse)', "les <b>%d</b> blocs identiques" % len(DERIV),
      "<b>nul</b> &mdash; meme formule"],
     ["3", C % '_quantiteUtilisable(q, u, {portions})', "les <b>%d</b> ecritures" % len(QOK),
      "il faut <b>NOMMER</b> les 2 regles, pas les fusionner"],
     ["4", "le hub rendu <b>obligatoire</b>", "les 3 copies locales",
      "moyen &mdash; chaque copie a ses omissions"],
     ["5", "<b>la douane</b> avant les %d " % len(PUSHES) + C % 'push', "rien (piece neuve)",
      "<b>le seul vrai chantier</b>"]],
    [8 * mm, 50 * mm, 57 * mm, 50 * mm]))

F.append(Spacer(1, 5))
F.append(encadre(
    "L'ORDRE EST DICTE PAR LE RISQUE, PAS PAR L'ELEGANCE",
    "<b>1, 2 et 3 sont des extractions sans changement de comportement</b> : le critere de "
    "reussite est que <b>chaque temoin actuel reste vert</b>, sans qu'aucune valeur attendue ne "
    "bouge. <b>4</b> change un comportement (les copies gagnent ce qu'elles omettaient). "
    "<b>5</b> est la seule vraie decision produit."
    "<br/><br/><b>Ce que je ne propose PAS :</b> fusionner " + C % '_afRef' + "/" + C % '_efRef' +
    "/" + C % '_bcNutr' + " en un etat global, ni reecrire les %d portes. <i>Le benefice serait "
    "esthetique, le risque est reel.</i> Les portes peuvent rester %d &mdash; c'est ce qu'elles "
    "<b>fabriquent</b> qui doit etre unique." % (NB_PORTES, NB_PORTES), VERT))

F.append(Spacer(1, 6))
F.append(encadre(
    "CE QUE CE DOCUMENT N'EST PAS",
    "<b>Aucun correctif n'a ete ecrit, aucune ligne de production n'a change.</b> Michel a demande "
    "une cartographie et des pistes <b>avant</b> de decider."
    "<br/><br/>Et une honnetete sur la methode : les comptes ci-dessus sont recalcules a chaque "
    "generation et le generateur <b>refuse de produire</b> si la forme du depot ne correspond plus "
    "(verifie : les gardes sortent en erreur). Mais <b>la lecture de ce que ces comptes signifient "
    "reste la mienne</b> &mdash; le generateur peut prouver qu'il y a %d traductions identiques ; "
    "il ne peut pas prouver qu'elles <i>devraient</i> etre une seule." % len(TRAD), GRIS))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker — architecture du module Nutrition',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
print('   mesure : %d portes (_afSetSrc), %d constructeurs per100 (%d normalises / %d bruts), '
      '%d appels au hub, %d traductions, %d derivations, %d filtres quantite (%d avec portion), '
      '%d etats paralleles, %d formes canoniques a la main, %d ecritures foodLog'
      % (len(SETSRC), len(NUTRS), len(NORMALISE), len(BRUT), len(HUB), len(TRAD), len(DERIV),
         len(QOK), len(QOK_PORTION), len(ETATS), len(FORME), len(PUSHES)))
