#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/CORRECTIF-PASTILLE.pdf — le correctif separe de ft-v1200 : la pastille
   « la derniere fois » qui survivait a l'aliment suivant. Douzieme document de la serie.

TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI.
La garde la plus importante est celle du PERIMETRE : le correctif ne doit PAS etre sous
`garderPaquet`, et `_qGrammes`/`_qReprenable` doivent etre intactes (consigne explicite).
Une autre recompte les APPELANTS, parce que le chiffre « 13 portes » ecrit dans le code
depuis ft-v1193 est FAUX — il y en a 12, et je l'ai recopie sans le recompter.

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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'CORRECTIF-PASTILLE.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
SONDE = open(os.path.join(ROOT, 'tools', 'instantane_1b23.js'), encoding='utf-8').read()
RUN = open(os.path.join(ROOT, 'tests', 'parcours', 'runner.js'), encoding='utf-8').read()
JDT = open(os.path.join(ROOT, 'docs', 'JOURNAL-DE-TEST.md'), encoding='utf-8').read()
BUGS = open(os.path.join(ROOT, 'BUGS.md'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = '(ft-v\d+)'", SW) or [None, '?'])[1]
SHA_INSTANTANE = 'b8f06e45d8c91fcc'   # inchangee depuis ft-v1199 : le correctif ne deplace rien

# ── LE CODE SANS SES COMMENTAIRES — la lecon du temoin aveugle de cette version meme :
#    un compteur qui ne distingue pas le code de ce qui en PARLE compte les deux.
CODE = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), APP)


def corps(nom, txt=None):
    m = re.search(r'function ' + nom + r'\(\w*\)\{[\s\S]*?\n\}', txt if txt is not None else CODE)
    return m.group(0) if m else ''


# ── LES DECOMPTES, REFAITS ICI ───────────────────────────────────────────────
OUBLI = corps('_afOublierAliment')
APPELANTS = [l for l in CODE.split('\n')
             if '_afOublierAliment(' in l and not l.strip().startswith('function')]
N_APPELANTS = len(APPELANTS)
N_GARDE = len([l for l in APPELANTS if 'garderPaquet' in l])

# Le correctif est-il dans le proprietaire, et HORS du drapeau du paquet ?
DEDANS = '_bcProposerDerniere(0)' in OUBLI
SOUS_GARDE = bool(re.search(r'garderPaquet[^\n]*\{[^\n]*_bcProposerDerniere\(0\)', OUBLI))

# Les deux regles metier que Michel a explicitement mises hors perimetre.
N_QGRAMMES = len([l for l in CODE.split('\n') if '_qGrammes(' in l])
C_QGRAMMES = corps('_qGrammes')
C_QREPRENABLE = corps('_qReprenable')

# Les temoins du bloc CCXCVII, et la sonde.
N_TEMOINS = len(re.findall(r"t\('CCXCVII ", RUN))
CLES = sorted(set(re.findall(r"out\['([^']+)'\]", SONDE)))

# Le chiffre FAUX que je propage depuis ft-v1193, compte a la source.
N_TREIZE = len(re.findall(r'13 portes', APP))

# CHAQUE GARDE PROTEGE UNE AFFIRMATION DU DOCUMENT.
if not OUBLI:
    raise SystemExit('`_afOublierAliment` est introuvable : tout le document parle d elle.')
if not DEDANS:
    raise SystemExit('LE CORRECTIF A DISPARU du corps de `_afOublierAliment` : le §2 affirme '
                     'qu il y vit, une fois, pour toutes les portes.')
if SOUS_GARDE:
    raise SystemExit('PERIMETRE ROMPU : le correctif est passe SOUS `garderPaquet`. Le §3 demontre '
                     'que les deux drapeaux ne nomment pas la meme chose, et que l y mettre '
                     'reproduirait le bug sur les deux portes qu on croit proteger.')
if N_APPELANTS != 12 or N_GARDE != 2:
    raise SystemExit('`_afOublierAliment` a %d appelants dont %d avec garderPaquet, pas 12 et 2 : '
                     'le §2 cite ces chiffres.' % (N_APPELANTS, N_GARDE))
if N_QGRAMMES != 3 or 'portion' in C_QGRAMMES:
    raise SystemExit('HORS PERIMETRE ROMPU : `_qGrammes` a bouge (%d occurrences, portions=%s). '
                     'Michel a explicitement interdit d y toucher dans ce correctif.'
                     % (N_QGRAMMES, 'portion' in C_QGRAMMES))
if "'portion'" not in C_QREPRENABLE:
    raise SystemExit('HORS PERIMETRE ROMPU : `_qReprenable` n accepte plus les portions.')
if N_TEMOINS != 16:
    raise SystemExit('Le bloc CCXCVII porte %d temoins, pas 16 : le §5 cite ce chiffre.' % N_TEMOINS)
if len(CLES) != 17:
    raise SystemExit('La sonde porte %d cles, pas 17 : le §5 cite ce chiffre.' % len(CLES))
# /!\ CE GARDE ETAIT AVEUGLE, ET C'EST LA LECON DE CETTE VERSION MEME, REPOSEE DANS LE GARDE
#     QUI LA PROTEGE. Il cherchait `'CORRIG' in JDT[:1200].upper()` : or l'entete porte QUATRE
#     mots de cette famille, dont « sans etre corrige » — qui dit exactement le CONTRAIRE.
#     Le `.upper()` les rendait tous equivalents, donc effacer la seule affirmation qui compte
#     laissait le garde vert. Mesure : la mutation « le journal ne dit plus CORRIGE » ne mordait
#     pas, la seule des dix dans ce cas.
#     => Un garde s'ancre sur l'AFFIRMATION exacte, jamais sur un mot de son champ lexical.
if 'CORRIGÉ en ft-v1200' not in JDT[:1200] or 'SURVIVAIT' not in JDT[:1200]:
    raise SystemExit('Le journal de test ne dit plus que le defaut est CORRIGE en ft-v1200 : le §1 '
                     'raconte precisement qu il y a ete ecrit AVANT d avoir le droit d etre corrige.')
if 'avant le mouvement' not in BUGS:
    raise SystemExit('La recidive de BUGS.md §61 (une attente qui demarre avant le mouvement) a '
                     'disparu : le §6 en fait la lecon principale de la version.')
if N_TREIZE == 0:
    raise SystemExit('Le « 13 portes » a ete corrige dans app.js : le §7 dit qu il y est ENCORE '
                     'et qu il part a la prochaine version. Mettre ce document a jour.')

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
                      'Force Tracker — le correctif separe de la pastille (%s) — 13/09/2026'
                      % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()



AVANT = """// AVANT — la pastille n'etait rendue qu'a DEUX endroits

openAddFood()            -> _bcProposerDerniere(0)   // a l'OUVERTURE de l'ecran
_offRemplirFormulaire()  -> _bcProposerDerniere(0)   // le hub, pour un scan neuf

// ... et le site qui la REPOSE vit DANS un garde :
if(P && it.u!=='portion' && (+P.kcal>0 || ...)){     // P = it.per100
   ...  _bcProposerDerniere(_qGrammes(it));
}

// => un aliment EN PORTIONS, ou SANS pour-100 g, ne franchit pas ce garde.
//    Personne ne touche la pastille, et celle du PRECEDENT reste a l'ecran."""

APRES = """// APRES — une ligne chez le proprietaire, donc toutes les portes d'un coup

function _afOublierAliment(opts){
  ...
  try{ if(!(opts && opts.garderPaquet)){ _bcPaquetG=0; _bcPaquetTxt='';
         if(typeof _bcProposerPaquet==='function') _bcProposerPaquet(); } }catch(e){}

  try{ if(typeof _bcProposerDerniere==='function') _bcProposerDerniere(0); }catch(e){}
  ...                                  ^^^^^^^^^^ PAS sous le drapeau du paquet
}"""

TEMOIN = """// LE TEMOIN AVEUGLE — et c'est un ecart d'UN SEUL ROUGE qui l'a trahi

// mutation « correctif retire »  ->  5 rouges
// code d'origine (avant le correctif) ->  6 rouges
//                                          ^ pourquoi cet ecart ?

// Le temoin de source filtrait les commentaires LIGNE A LIGNE :
//   on retire les lignes qui COMMENCENT par  *  //  /*  ou un accent grave.
// Or les lignes de continuation de ce fichier commencent par des pictogrammes :
//     « Deux causes cumulees ... : `_bcProposerDerniere(0)` n'etait ... »
//        ^ elle SURVIT au filtre, et elle porte le motif cherche.

// => le temoin restait VERT avec le correctif retire.
// Corrige : il retire les blocs de commentaire ENTIERS."""

ATTENTE = """// LA RECIDIVE DE BUGS.md §61 — deux passes completes pour l'etablir

// Symptome : un temoin VOISIN rouge en passe complete, vert 3/3 en isole.
// Mon 1er correctif : recopier la boucle « attendre que scrollTop se stabilise ».
// Resultat :  tours:1  ...  apresReset:75
//             ^ sortie au 1er tour      ^ defilement ENCORE EN VOL

// LA CAUSE :
//   une boucle de stabilite qui demarre AVANT le mouvement
//   mesure « rien ne bouge encore » et le lit comme « le mouvement est fini ».
// Un defilement `smooth` ne commence pas au clic ; sous charge, il commence plus tard.

// LE BON GESTE : attendre la CONDITION reellement mesuree.
{let n=0; while(n<40 && !dansLaVue('af-coherence')){ await d(80); n++; }}
{let eg=0,prev=sc.scrollTop,n=0;                 // puis 3 echantillons egaux
 while(eg<3 && n<40){ await d(80); const v=sc.scrollTop;
   eg = (v===prev) ? eg+1 : 0; prev=v; n++; }}

// Et il n'est PAS devenu creux : avec `_amenerALaVue` neutralisee, il rougit toujours."""


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("Le correctif separe de la pastille", 'titre'))
F.append(P("Force Tracker &mdash; 13/09/2026, " + C % VERSION + ". Douzieme document de la serie, et "
           "le premier qui n'est <b>pas</b> une sous-etape d'extraction. Michel isole le sujet : "
           "<i>&laquo; avant de continuer les 4 sous-etapes restantes, je veux traiter separement le "
           "defaut reel decouvert sur la pastille &raquo;</i>, avec une consigne explicite &mdash; "
           "<i>&laquo; ne profite pas de ce correctif pour modifier " + C % '_qGrammes' + ", "
           + C % '_qReprenable' + ", les portions ou une autre regle metier &raquo;</i>.", 'sous'))

F.append(encadre(
    "CE QUI COMPTE DANS CETTE VERSION N'EST PAS LA LIGNE DE CODE",
    "<b>Le correctif tient en une ligne.</b> Ce qui vaut d'etre lu, c'est <b>trois choses qui se sont "
    "passees autour</b> :"
    "<br/><br/><b>(1) Le defaut a attendu son propre feu vert.</b> Trouve la veille en etendant une "
    "sonde, il a ete <b>mesure puis ECRIT sans etre corrige</b> &mdash; une sous-etape d'extraction ne "
    "change aucun comportement, et son critere est un instantane identique octet pour octet."
    "<br/><b>(2) La ligne ne devait PAS aller sous le drapeau voisin</b>, qui lui ressemble et ne dit "
    "pas la meme chose. L'y mettre aurait reproduit le bug sur les deux portes qu'on croit proteger."
    "<br/><b>(3) Deux instruments de mesure m'ont menti</b> &mdash; un temoin de source aveugle, et une "
    "attente qui mesurait la machine au lieu du produit. Le second a coute <b>trois passes completes</b>."))

# ── 1 ──
F.append(P("1. Le defaut a attendu son feu vert, et c'est le point de methode", 'h1'))
F.append(P("Il a ete trouve <b>pendant</b> une sous-etape d'extraction, qui a un contrat strict : "
           "<i>aucun changement de comportement</i>, verifie par un instantane identique. Le corriger "
           "au passage aurait donc <b>casse le critere de la sous-etape</b> &mdash; et ne pas l'ecrire "
           "l'aurait fait <b>disparaitre avec la session</b>.", 'p'))
F.append(encadre(
    "LES DEUX ISSUES D'UN DEFAUT TROUVE EN CHEMIN, ET POURQUOI LA TROISIEME EXISTE",
    "Sans un endroit ou le poser, un defaut trouve en cours de route n'a que deux sorties : "
    "<b>etre corrige tout de suite</b> (donc melanger deux travaux et perdre le critere binaire), ou "
    "<b>etre oublie</b>."
    "<br/><br/>=&gt; Il a ete <b>mesure a la sonde, ecrit avec sa cause et son correctif d'une ligne</b>, "
    "et laisse a l'auteur du produit. Il a ete corrige <b>le lendemain, sur demande explicite</b>."
    "<br/><br/><i>Le cout d'ecrire une ligne dans un fichier d'attente est de dix secondes ; le cout de "
    "melanger deux travaux est de ne plus savoir lequel des deux a casse quelque chose.</i>", VERT))

# ── 2 ──
F.append(P("2. Le defaut, et le correctif", 'h1'))
F.append(bloc_code(AVANT))
F.append(bloc_code(APRES))
F.append(P("Mesure a l'instant, dans le code servi : " + C % '_afOublierAliment' + " a <b>%d "
           "appelants</b>, dont <b>%d</b> passent " % (N_APPELANTS, N_GARDE) + C % 'garderPaquet' + ". "
           "La ligne vit chez elle, <b>une seule fois</b> &mdash; jamais recopiee porte par porte : "
           "<i>un patron qu'on recopie a chaque porte EST la duplication que ce chantier supprime "
           "ailleurs</i>.", 'petit'))

F.append(PageBreak())

# ── 3 ──
F.append(P("3. Le point de conception : deux drapeaux qui ne nomment pas la meme chose", 'h1'))
F.append(P("Le fichier d'attente disait <i>&laquo; a cote de celui du paquet &raquo;</i>. "
           "<b>Vrai pour l'endroit, faux pour la condition.</b>", 'p'))
F.append(tableau(
    ["drapeau", "ce qu'il dit", "ses appelants"],
    [[C % 'garderPaquet',
      "&laquo; le poids vient du produit qu'on <b>POURSUIT</b> &raquo;",
      "les <b>%d</b> qui travaillent sur le produit <b>SCANNE</b> : sa fiche est vide, ou on le "
      "calibre" % N_GARDE],
     ["la pastille",
      "&laquo; une quantite reprise <b>AVANT</b> &raquo;",
      "les <b>2 seules</b> qui la posent : reprise depuis &laquo; Mes aliments &raquo;, et depuis la "
      "recherche du journal"]],
    [32 * mm, 56 * mm, 77 * mm]))
F.append(encadre(
    "POURQUOI LA METTRE SOUS LE DRAPEAU REPRODUIRAIT LE BUG",
    "Les deux appelants qui passent " + C % 'garderPaquet' + " sont sur le chemin du <b>code-barres</b>. "
    "Une pastille &laquo; la derniere fois &raquo; ne peut y etre qu'un <b>reliquat d'une reprise "
    "anterieure</b> &mdash; jamais celle du produit courant."
    "<br/><br/>=&gt; <b>La garder sur ces deux portes, c'est exactement le defaut qu'on corrige.</b> "
    "<i>Une ligne juste, posee sous la mauvaise condition, reste un bug.</i>"
    "<br/><br/><b>Mesure</b> : la mutation qui l'y met fait <b>2 rouges</b>, dont un temoin de source "
    "qui lit le corps du proprietaire. Deux gardes de ce document le verifient aussi.", ORANGE))

# ── 4 ──
F.append(P("4. La contre-epreuve, et pourquoi elle etait VERTE avant le correctif", 'h1'))
F.append(P("Un correctif qui se contenterait d'<b>eteindre</b> la pastille passerait tous les temoins "
           "du defaut &mdash; et casserait la fonctionnalite en la &laquo; reparant &raquo;. D'ou une "
           "contre-epreuve : un aliment qui a <b>sa propre</b> derniere quantite en grammes doit voir "
           "<b>SA</b> pastille (200), pas celle d'avant (150).", 'p'))
F.append(encadre(
    "ELLE EST VERTE AVANT ET APRES, ET C'EST CE QUI LA REND UTILE",
    "Un temoin qui ne devient vert qu'apres le correctif mesure le correctif. Un temoin <b>deja vert "
    "avant</b> mesure la <b>fonctionnalite</b> &mdash; il est la pour dire <i>&laquo; tu viens de la "
    "casser &raquo;</i>."
    "<br/><br/>=&gt; Et il mord : la mutation &laquo; on POSE au lieu de RENDRE &raquo; fait <b>7 "
    "rouges</b>, celle du sur-nettoyage (le champ tape est efface) en fait <b>1</b>, exactement le sien.", VERT))

# ── 5 ──
F.append(P("5. Les mesures", 'h1'))
F.append(tableau(
    ["preuve", "resultat"],
    [["Temoin du bug <b>avant</b> correction",
      "<b>6 rouges</b> sur le code d'origine &mdash; le scenario decrit, par les <b>deux</b> portes, "
      "plus l'autre moitie du garde (un aliment sans pour-100 g)"],
     ["Apres", "<b>%d / %d</b> (bloc CCXCVII : %d temoins de navigateur + 4 de source)"
      % (N_TEMOINS, N_TEMOINS, N_TEMOINS - 4)],
     ["Controle negatif", "<b>6 mutations, toutes mordent sur leur PROPRE temoin</b> ; controle sain "
      "a 0 rouge <b>avant ET apres</b>"],
     ["Instantane de l'extraction",
      "<b>inchange</b>, sha256 " + C % SHA_INSTANTANE + " &mdash; le correctif ne deplace pas le sol "
      "du chantier en cours (%d cles)" % len(CLES)],
     ["Passe complete", "<b>3649 / 3649</b>, total predit = total obtenu"],
     ["Autres bancs", "calculs 339/339 &middot; muscles 241/241 &middot; croises 50/50 &middot; "
      "dates 9/9 &middot; donnees : aucun trou nouveau"],
     ["Hors perimetre, fige",
      C % '_qGrammes' + " (%d occurrences, <b>aucune</b> mention de portion) et " % N_QGRAMMES
      + C % '_qReprenable' + " (portions intactes) &mdash; 2 temoins"],
     ["Ecran", "<b>rien ne change</b> : une pastille cesse de mentir"]],
    [42 * mm, 123 * mm]))

F.append(PageBreak())

# ── 6 ──
F.append(P("6. Les deux instruments qui m'ont menti", 'h1'))
F.append(P("<b>(1) Un temoin de source aveugle</b> &mdash; trahi par un <b>ecart d'un seul rouge</b>.", 'h2'))
F.append(bloc_code(TEMOIN))
F.append(P("=&gt; <b><i>Un total qu'on explique au lieu de l'accepter.</i></b> 5 au lieu de 6, c'est "
           "assez proche pour passer inapercu &mdash; et c'etait la seule trace d'un temoin qui serait "
           "reste vert sur un correctif absent.", 'petit'))

F.append(P("<b>(2) Une attente qui mesurait la machine</b> &mdash; cout : <b>trois passes completes</b>.", 'h2'))
F.append(bloc_code(ATTENTE))
F.append(encadre(
    "ET J'AI CONCLU TROP TOT EN CHEMIN, CE QUI EST LA VRAIE ERREUR",
    "Un temoin <b>voisin</b> a rougi. J'ai lance une passe de controle <b>sans</b> le correctif : il y "
    "etait vert. J'en ai conclu, et annonce, que le correctif etait en cause."
    "<br/><br/><b>Une passe de chaque cote. n=1.</b> La passe suivante <i>avec</i> le correctif est "
    "revenue <b>verte partout</b>."
    "<br/><br/>=&gt; <b><i>Un contre-exemple a n=1 ne tranche pas contre un temoin deja connu pour etre "
    "instable.</i></b> Reproduire avant de conclure vaut <b>dans les deux sens</b> &mdash; y compris, et "
    "surtout, quand la mesure semble accuser son propre travail."))

# ── 7 ──
F.append(P("7. Un chiffre faux, propage par moi, trouve en ecrivant ce document", 'h1'))
F.append(P("Le code dit <b>&laquo; 13 portes &raquo;</b> a <b>%d endroits</b>, depuis une version "
           "anterieure. Mes textes de cette version-ci le repetent. <b>Recompte a la source : il y en a "
           "%d</b>, et l'historique dit que ca a <b>toujours</b> ete 12." % (N_TREIZE, N_APPELANTS), 'p'))
F.append(encadre(
    "UN CHIFFRE ROND QU'ON N'A JAMAIS RECOMPTE SE PROPAGE TOUT SEUL",
    "Il a ete ecrit une fois, recopie dans <b>%d commentaires</b>, puis repris dans un message de "
    "commit, un journal de version, un fichier d'etat et un journal de partage &mdash; <b>sans que "
    "personne, moi compris, ne le recompte.</b>" % N_TREIZE +
    "<br/><br/>=&gt; C'est la meme famille que celle documentee deux versions plus tot (<i>un motif de "
    "recherche qui suppose une syntaxe ne compte pas les endroits</i>), <b>retournee contre son "
    "auteur</b>. Un garde de ce document recompte les appelants a chaque generation ; il refusera de "
    "produire le jour ou le chiffre bougera."
    "<br/><br/>/!\\ <b>Etat honnete</b> : les documents sont corriges, <b>les commentaires du code ne le "
    "sont pas encore</b> &mdash; les toucher change un fichier servi, donc ca part avec la prochaine "
    "version plutot que dans un correctif qui ne devait rien changer d'autre.", ORANGE))

# ── 8 ──
F.append(P("8. Ce que ca ne fait pas", 'h1'))
F.append(tableau(
    ["", ""],
    [["Les regles metier", "<b>intactes</b> &mdash; " + C % '_qGrammes' + ", " + C % '_qReprenable'
      + ", les portions. Consigne explicite, figee par 2 temoins"],
     ["Les 4 sous-etapes restantes", "<b>non faites</b> : " + C % '1b-v' + ", " + C % '3-iii' + ", "
      + C % '3-iv' + ", " + C % '3-v'],
     ["Le hub et la douane", "apres, consigne inchangee"],
     ["Favoris entre onglets, ecart 48,3 / 48", "ouverts, non corriges"],
     ["Historique, migrations, harmonisations produit", "non touches"]],
    [58 * mm, 107 * mm]))
F.append(P("<b>Rollback</b> : un " + C % 'git revert' + " du commit &mdash; une ligne dans le fichier "
           "servi, un bloc de temoins.", 'petit'))

F.append(Spacer(1, 8))
F.append(P(("Document genere depuis le code servi &mdash; tous les decomptes cites sont recomptes a "
            "chaque generation (%d appelants dont %d avec le drapeau, %d occurrences de la regle "
            "voisine, %d temoins, %d cles de sonde, %d mentions du chiffre faux). "
            % (N_APPELANTS, N_GARDE, N_QGRAMMES, N_TEMOINS, len(CLES), N_TREIZE)) +
           "<b>Onze gardes refusent de produire si un fait tombe</b> &mdash; dont un qui verifie que le "
           "correctif n'est <b>pas</b> passe sous le drapeau du paquet, deux que les regles metier "
           "mises hors perimetre sont <b>intactes</b>, et un qui surveille le <b>chiffre faux</b> pour "
           "que ce document ne survive pas a sa correction. Source : "
           + C % 'tools/gen_1200_pdf.py' + ".", 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=23 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker - le correctif separe de la pastille',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK -> %s (%d Ko)' % (OUT, os.path.getsize(OUT) // 1024))
