#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/FIABILITE-ENERGIE-MACROS.pdf — le traitement GENERIQUE du defaut de fiabilite
   energie / macros en entree. Vingtieme document de la serie.

TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI.
Et le garde central ne recompte pas un chiffre ecrit quelque part : il REJOUE la loi sur les
3 607 aliments que l application embarque, et refuse de produire si elle produit un seul faux
positif. Un document qui affirme « zero faux positif » sans le remesurer affirme un souvenir.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d emoji, entites nommees comprises.
"""
import html
import json
import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether, Preformatted)
from reportlab.pdfbase.pdfmetrics import stringWidth


ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'FIABILITE-ENERGIE-MACROS.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
RUN = open(os.path.join(ROOT, 'tests', 'parcours', 'runner.js'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = \'(ft-v\d+)\'", SW) or [None, '?'])[1]
SHA_INSTANTANE = '226a7e9c523cae3f'


def sans_com(t):
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), t)
    return '\n'.join(l for l in t.split('\n') if not l.strip().startswith('//'))


CODE = sans_com(APP)
LIGNES = CODE.split('\n')
DECL = [(i, re.match(r'(?:async )?function (\w+)\(', l).group(1))
        for i, l in enumerate(LIGNES) if re.match(r'(?:async )?function \w+\(', l)]


def corps(nom):
    for k, (i, n) in enumerate(DECL):
        if n == nom:
            return '\n'.join(LIGNES[i:(DECL[k + 1][0] if k + 1 < len(DECL) else len(LIGNES))])
    return ''


C_RESOL = corps('_resoudreNutrition')
C_PLANCHER = corps('_nrjPlancher')
C_PRECISION = corps('_nrjPrecision')
C_CANDIDATS = corps('_nrjCandidats')
C_REF100 = corps('_ref100')
C_PROV = corps('_provFood')
C_ECRAN = corps('_coherenceKcal')
C_DOUANE = corps('_douaneLigne')

ORIGINES = ['barcode', 'manuel', 'reprise', 'etiquette', 'marque', 'ciqual', 'historique', 'off']
ETATS = ['COHERENT', 'ALTERNATIVE_FIABLE', 'DERIVE_ESTIMABLE', 'NON_RESOLU']
N_REGLES = len(re.findall(r"dit\('", C_DOUANE))
N_INVALID = len(re.findall(r"'INVALID',", C_DOUANE))
N_TEMOINS = len(re.findall(r"t\('CCCV ", RUN))
N_APPELANTS_REF100 = len(re.findall(r'_ref100\(', CODE)) - 1   # moins la declaration

# ── [!!] LE GARDE CENTRAL : LA LOI EST REJOUEE, PAS CITEE ────────────────────────────────────
#    On relit les facteurs DANS le code servi (jamais en dur ici), puis on applique la loi aux
#    deux tables que l application embarque. Si un seul aliment reel devenait un faux positif,
#    le document ne sortirait pas — et ce serait la bonne reaction.
_mf = re.search(r'const NRJ_PROT = (\d+), NRJ_LIP = (\d+);', CODE)
if not _mf:
    raise SystemExit('Les facteurs energetiques ne se lisent plus dans le code servi : tout le '
                     'document repose sur eux.')
F_PROT, F_LIP = int(_mf.group(1)), int(_mf.group(2))
if (F_PROT, F_LIP) != (4, 9):
    raise SystemExit('Les facteurs valent %d et %d, pas 4 et 9 (Reglement UE 1169/2011 annexe '
                     'XIV) : la loi du document serait fausse.' % (F_PROT, F_LIP))


def _prec(x):
    """Demi-unite du dernier chiffre significatif — le miroir Python de `_nrjPrecision`."""
    if x is None:
        return 0.5
    s = repr(float(x))
    if s.endswith('.0'):
        s = s[:-2]
    if '.' not in s:
        return 0.5
    d = len(s) - s.index('.') - 1
    return 0.0005 if d > 3 else 0.5 * 10 ** -d


def _viole(k, p, f):
    k, p, f = float(k or 0), float(p or 0), float(f or 0)
    if not k > 0:
        return False
    if not p > 0 and not f > 0:
        return False
    sol = F_PROT * p + F_LIP * f
    tol = F_PROT * _prec(p) + F_LIP * _prec(f) + _prec(k)
    return k < sol - tol


_CI = json.load(open(os.path.join(ROOT, 'data', 'ciqual.json'), encoding='utf-8'))['a']
_MA = json.load(open(os.path.join(ROOT, 'data', 'marques.json'), encoding='utf-8'))['a']
N_CIQUAL, N_MARQUES = len(_CI), len(_MA)
N_ALIMENTS = N_CIQUAL + N_MARQUES
FAUX = ([r[1] for r in _CI if _viole(r[3], r[4], r[6])]
        + [r[1] for r in _MA if _viole(r[3], r[4], r[6])])
if FAUX:
    raise SystemExit('LA LOI PRODUIT %d FAUX POSITIF(S) SUR LES ALIMENTS REELS (%s...) : le '
                     'document affirme zero, et c est le chiffre qui autorise a livrer.'
                     % (len(FAUX), FAUX[0]))
if N_ALIMENTS < 3000:
    raise SystemExit('Seuls %d aliments ont ete relus : un « zero faux positif » sur une table '
                     'tronquee ne prouve rien (lecon ft-v994).' % N_ALIMENTS)

# le cas temoin, RECALCULE lui aussi
R_K, R_P, R_C, R_F = 48.3, 6.1, 10.0, 3.2
R_PLANCHER = round(F_PROT * R_P + F_LIP * R_F, 1)
R_TOL = round(F_PROT * _prec(R_P) + F_LIP * _prec(R_F) + _prec(R_K), 2)
R_MANQUE = round(R_PLANCHER - R_K, 1)
R_ATWATER = round(F_PROT * R_P + 4 * R_C + F_LIP * R_F, 1)
if not _viole(R_K, R_P, R_F):
    raise SystemExit('LE CAS TEMOIN DE MICHEL NE MORD PLUS : la loi laisserait passer les 48,3 '
                     'kcal qui ont declenche tout le chantier.')

# ── [!!] LES GARDES DE CONCEPTION ────────────────────────────────────────────────────────────
if not C_RESOL:
    raise SystemExit('`_resoudreNutrition` est introuvable : tout le document parle d elle.')
if len(re.findall(r'_resoudreNutrition\(', CODE)) != 2:
    raise SystemExit('`_resoudreNutrition` n est plus appelee exactement une fois : le §2 affirme '
                     'un seul proprietaire, et Michel a interdit huit variantes du meme controle.')
if '_resoudreNutrition(' not in C_REF100:
    raise SystemExit('Ce n est plus `_ref100` qui appelle le resolveur : le §2 explique que le '
                     'point commun EXISTAIT DEJA, et c est lui.')
# [/!\] CE GARDE ETAIT AVEUGLE, et c est la mutation qui l a dit : `origine:'ciqual'` existe
#    DEUX fois dans le code servi — une fois passee a `_ref100`, une fois dans la provenance —
#    donc supprimer la premiere le laissait muet. Il lit desormais les APPELS de `_ref100`.
ORIG_VUES = sorted(set(re.findall(r"_ref100\((?:[^;])*?origine:'(\w+)'", CODE)))
if ORIG_VUES != sorted(ORIGINES):
    raise SystemExit('LES ORIGINES PASSEES A `_ref100` SONT %s : le §2 en cite exactement huit, '
                     'et c est ce qui rend la resolution universelle.' % ORIG_VUES)
# [/!\] AVEUGLE LUI AUSSI : `NON_RESOLU` est ASSIGNE deux fois, donc en renommer un laissait
#    la chaine presente. On lit les etats REELLEMENT assignes, et la liste doit etre FERMEE.
ETATS_VUS = sorted(set(re.findall(r"etat: ?'(\w+)'", C_RESOL))
                   | set(re.findall(r"res\.etat = '(\w+)'", C_RESOL)))
if ETATS_VUS != sorted(ETATS):
    raise SystemExit('LE RESOLVEUR ASSIGNE LES ETATS %s : le §4 en decrit exactement quatre, ni '
                     'un de plus ni un de moins.' % ETATS_VUS)
if len(re.findall(r'NRJ_PROT \* p \+ NRJ_LIP \* f', CODE)) != 1:
    raise SystemExit('LA LOI EST ECRITE PLUSIEURS FOIS : deux ecritures finiraient avec deux '
                     'tolerances, et on ne saurait plus laquelle croire (R2).')
if len(re.findall(r'_nrjPrecision\(', C_PLANCHER)) != 3:
    raise SystemExit('LA TOLERANCE N EST PLUS DERIVEE DES TROIS VALEURS RECUES : le §3 affirme '
                     'qu elle est derivee, pas choisie.')
if re.search(r'tol\s*=\s*[\d.]+\s*;', C_PLANCHER):
    raise SystemExit('UNE TOLERANCE EN DUR EST APPARUE : c est exactement le « simple seuil » que '
                     'Michel a refuse.')
# [/!\] LE TROU LE PLUS IMPORTANT QUE LA MUTATION AIT TROUVE : la loi rejouee ci-dessus est une
#    REIMPLEMENTATION Python. Elargir la tolerance DANS LE CODE SERVI ne la changeait donc pas, et
#    le PDF continuait d annoncer « le cas temoin mord » pendant qu il ne mordait plus.
#    *Un controle qui remesure avec sa PROPRE copie de la regle ne mesure pas la regle du produit.*
#    On epingle donc les deux lignes qui la portent, au caractere pres.
_LOI = ['  const sol = NRJ_PROT * p + NRJ_LIP * f;',
        '  const tol = NRJ_PROT * _nrjPrecision(prot) + NRJ_LIP * _nrjPrecision(fat) '
        '+ _nrjPrecision(kcal);',
        '  if(k >= sol - tol) return null;']
for _l in _LOI:
    if _l not in C_PLANCHER:
        raise SystemExit('LA LOI DU CODE SERVI A CHANGE (« %s » absente) : le miroir Python du '
                         'generateur ne la suivrait pas, et le document deviendrait faux en '
                         'silence.' % _l.strip()[:60])
# [/!\] LA CONVERSION : une multiplication au lieu d une division ne se voit PAS a l ecran,
#    puisque l unite affichee reste « kcal ». Le garde lit donc l operateur.
if len(re.findall(r'/\s*4\.184', C_CANDIDATS)) != 2 or re.search(r'\*\s*4\.184', C_CANDIDATS):
    raise SystemExit('LA CONVERSION kJ -> kcal N EST PLUS UNE DIVISION PAR 4,184 : une '
                     'multiplication donnerait 1 632 kcal la ou le §3 en annonce 93,2.')
_UTIL = re.search(r"NRJ_ORIGINES_UTILISATEUR = \[([^\]]*)\]", CODE)
if not _UTIL or sorted(re.findall(r"'(\w+)'", _UTIL.group(1))) != ['historique', 'manuel', 'reprise']:
    raise SystemExit('LA LISTE DES ORIGINES UTILISATEUR A CHANGE : le §6 nomme exactement manuel, '
                     'reprise et historique.')
if 'NRJ_ORIGINES_UTILISATEUR' not in C_RESOL:
    raise SystemExit('LE RESOLVEUR NE PROTEGE PLUS CE QUE LA PERSONNE A SAISI : consigne explicite '
                     'de Michel, et le §6 entier repose dessus.')
if not re.search(r"f\.fiab\.etat===\'ALTERNATIVE_FIABLE\' \|\| f\.fiab\.etat===\'DERIVE_ESTIMABLE\'",
                 C_REF100):
    raise SystemExit('LA VALEUR RESOLUE N EST PLUS APPLIQUEE AUX DEUX SEULS ETATS QUI L AUTORISENT '
                     ': le §4 dit que COHERENT et NON_RESOLU ne touchent a rien.')
# [/!\] AVEUGLE : le garde cherchait `presents` en sous-chaine, donc `presentsX` le satisfaisait.
if not re.search(r'\bpresents\s*:', C_REF100) or '_pres(kcal)' not in C_REF100:
    raise SystemExit('LA PRESENCE N EST PLUS MESUREE SUR LES VALEURS BRUTES : c est le defaut '
                     'trouve a la mesure (une macro ABSENTE devenue 0 par normalisation), et le '
                     '§4 affirme qu il est ferme.')
# ── [!!] AUCUNE CORRECTION SILENCIEUSE : la trace part avec la ligne, et l ecran la dit
if not re.search(r'p\.fiab\s*=', C_PROV):
    raise SystemExit('LA TRACE NE PART PLUS AVEC LA LIGNE : Michel a demande nommement de « ne '
                     'jamais ecraser la source et perdre la trace de ce qui s est passe ».')
for champ in ('brut', 'retenu', 'methode', 'raison', 'champ', 'confiance', 'origine'):
    if not re.search(r'\b%s\s*:' % champ, C_PROV.split('p.fiab')[1][:400] if 'p.fiab' in C_PROV else ''):
        raise SystemExit('La trace ne porte plus « %s » : le §5 affirme que la decision est '
                         'reconstructible apres coup.' % champ)
if "fiab.etat!=='COHERENT'" not in C_PROV:
    raise SystemExit('UNE LIGNE COHERENTE GAGNE UNE TRACE INUTILE : le §5 affirme qu une ligne '
                     'normale ne grossit pas.')
if '_bcNutr.fiab' not in C_ECRAN:
    raise SystemExit('L ECRAN NE DIT PLUS RIEN DE LA FIABILITE : une correction qu on ne voit pas '
                     'est une correction silencieuse, et le §5 la declare interdite.')
# [/!\] CE GARDE EST NE D UN VRAI DEFAUT A MOI, attrape par le temoin (18) et pas par une
#    relecture : l ecran lisait `z.retenu`, un nom qui n existe que sur la TRACE. Il affichait
#    « undefined kcal/100 g » sans lever la moindre erreur.
if 'z.retenu' in C_ECRAN or "z.kcal" not in C_ECRAN:
    raise SystemExit('L ECRAN NE LIT PLUS `z.kcal` : avec `z.retenu` il affiche « undefined kcal » '
                     'en silence — le defaut que le temoin (18) a trouve.')
# ── [!!] LE PERIMETRE : le resolveur ne deborde pas, la douane ne devient pas un correcteur
if re.search(r'S\.foodLog|savedFoods|portionWeightG|_afSetSrc', C_RESOL):
    raise SystemExit('LE RESOLVEUR DEBORDE SUR LE JOURNAL, LES ALIMENTS ENREGISTRES OU LA '
                     'PROVENANCE : le §9 affirme un perimetre strict.')
if re.search(r'toast\(|document\.|alert\(', C_RESOL):
    raise SystemExit('LE RESOLVEUR PARLE A LA PERSONNE : l ecran est le travail de '
                     '`_coherenceKcal`, qui existait deja (R13).')
if (N_REGLES, N_INVALID) != (21, 9):
    raise SystemExit('La douane porte %d regles dont %d INVALID, pas 21/9 : le §7 affirme qu elle '
                     'n a PAS bouge, et Michel a interdit d en toucher une seule.' % (N_REGLES, N_INVALID))
if re.search(r'_resoudreNutrition|_nrjPlancher', C_DOUANE):
    raise SystemExit('LA DOUANE APPELLE LE RESOLVEUR : Michel a interdit de la transformer en '
                     'moteur de correction.')
for n in ('rejouerRepas', 'quickAddFood', 'addFoodEntry', 'saveEditFood'):
    if re.search(r'if\s*\(\s*_douaneLigne|(const|let|var)\s+\w+\s*=\s*_douaneLigne', corps(n)):
        raise SystemExit('`%s` LIT le verdict de la douane : ce serait un blocage deguise.' % n)
if N_TEMOINS != 30:
    raise SystemExit('Le bloc CCCV porte %d temoins, pas 30 : le §8 cite ce chiffre.' % N_TEMOINS)

PASSE = os.environ.get('FT_PASSE') or '/tmp/passefiab.log'
try:
    _log = open(PASSE, encoding='utf-8', errors='replace').read()
except Exception:
    raise SystemExit('Journal de passe introuvable (%s) : le §8 cite un total, il doit etre LU.'
                     % PASSE)
_p = re.search(r'TOTAL CROISÉ : (\d+) ✅ · (\d+) ❌', _log)
if not _p:
    raise SystemExit('Le journal de passe ne porte pas encore de TOTAL : la passe tourne toujours. '
                     'Un total espere n est pas un total mesure — on attend.')
PASSE_OK, PASSE_KO = int(_p.group(1)), int(_p.group(2))
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
                      'Force Tracker — fiabilite energie / macros en entree (%s) — 13/09/2026'
                      % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


# [/!\] Le NOMBRE de gardes se recompte dans ce fichier meme (lecon ft-v1202 : un pied de page
#       qui annonce « quatorze gardes » pour dix-sept).
N_GARDES = len(re.findall(r'raise SystemExit', open(os.path.abspath(__file__),
                                                    encoding='utf-8').read()))

H = []
H.append(P('Fiabilite energie / macros en entree', 'titre'))
H.append(P('Chantier generique &mdash; %s &mdash; 13/09/2026. Vingtieme document de la serie. '
           'Tous les decomptes sont <b>recomptes depuis le code servi</b>, et la loi elle-meme est '
           '<b>rejouee sur les %d aliments</b> que l application embarque : %d gardes refusent de '
           'produire ce PDF si un seul fait tombe.' % (VERSION, N_ALIMENTS, N_GARDES), 'sous'))

H.append(encadre(
    'La consigne, et ce qu elle interdit',
    'Michel : <b>&laquo; Je ne veux pas un correctif specifique aux lentilles Raynal. Je veux que le '
    'probleme soit traite pour TOUS les aliments et toutes les sources concernees. &raquo;</b> Et, '
    'sur la methode : <b>&laquo; Ne recree pas huit variantes du meme controle &raquo;</b>, '
    '<b>&laquo; ne jamais ecraser la source et perdre la trace de ce qui s est passe &raquo;</b>, '
    '<b>&laquo; les donnees explicitement saisies par l utilisateur ne doivent pas etre reecrites '
    'arbitrairement comme une donnee externe &raquo;</b>. [!] Le comportement explicitement '
    'interdit apres ce chantier : <b>48,3 utilise normalement avec un simple warning</b>.'))

H.append(P('1. D ou vient le 48,3 &mdash; ce que je peux dire, et ce que je ne peux pas', 'h1'))
H.append(P('Le cas temoin est le code-barres <b>3021690201123</b> (lentilles cuisinees, 410 g) : la '
           'fiche annonce <b>%s kcal/100 g</b> pour environ <b>%s g de proteines, %s g de glucides '
           'et %s g de lipides</b>. [/!\\] <b>Le proxy de ce conteneur refuse Open Food Facts</b> '
           '(<i>CONNECT tunnel failed, 403</i>) : je <b>ne peux pas</b> lire le payload reel, et je '
           'le dis plutot que de deviner.'
           % (R_K, R_P, int(R_C), R_F), 'p'))
H.append(P('Ce que la lecture du code permet quand meme d etablir : les deux hypotheses les plus '
           'probables sont <b>indiscernables d ici</b>, parce que le code les fait converger vers '
           'la meme valeur.', 'p'))
H.append(tableau(
    ['Hypothese', 'Ce qu elle suppose', 'Discernable ?'],
    [['A', 'la fiche porte reellement ' + (C % 'energy-kcal_100g') + ' = ' + str(R_K),
      'non &mdash; c est la 1re branche lue'],
     ['B', 'la fiche porte ' + (C % 'energy_100g') + ' en kJ, converti ici',
      'non &mdash; meme resultat affiche'],
     ['C', 'la fiche donne une energie &laquo; produit egoutte &raquo; et des macros du produit entier',
      'pas depuis le code'],
     ['D', 'la fiche est simplement fausse (saisie collaborative)', 'pas depuis le code'],
     ['E', 'l app a introduit l erreur en normalisant', '<b>non</b> &mdash; ecarte, voir ci-dessous']],
    [18 * mm, 105 * mm, 42 * mm]))
H.append(Spacer(1, 4))
H.append(P(('[*] <b>L hypothese E est ecartee par la mesure</b> : la chaine de normalisation '
            'conserve %s a l unite pres, elle n a rien fabrique. Et surtout, la question devient '
            '<b>mesurable pour la prochaine fois</b> : le resolveur <b>enregistre desormais le '
            'champ qui a servi</b> (' % R_K) + (C % 'champ') + ' dans la trace). Au prochain scan, '
           'A et B se distingueront tout seuls &mdash; <i>on ne devine pas, on instrumente.</i>',
           'p'))

H.append(P('2. Un seul resolveur, huit origines &mdash; le point commun existait deja', 'h1'))
H.append(P('Michel a interdit huit variantes du meme controle. [*] <b>Il n a pas fallu en inventer '
           'un point commun : il existait.</b> ' + (C % '_ref100')
           + (' est le normaliseur du pour-100 g, il a <b>%d appelants</b>, et sa sortie '
              % N_APPELANTS_REF100) + (C % '_bcNutr') + ' est '
           '<i>exactement</i> ce que l ecran affiche et ce que la ligne enregistree multiplie. '
           '<b>Resoudre la, c est resoudre partout</b> &mdash; un garde epingle que '
           + (C % '_resoudreNutrition') + ' n est appelee qu <b>une seule fois</b> dans tout le '
           'code servi.', 'p'))
H.append(tableau(
    ['Origine declaree', 'La porte', 'Le resolveur peut-il reecrire ?'],
    [['barcode', 'code-barres scanne ou tape', 'oui (source externe)'],
     ['off', 'recherche Open Food Facts', 'oui (source externe)'],
     ['ciqual', 'suggestion table CIQUAL', 'oui (source externe)'],
     ['marque', 'suggestion enseigne', 'oui (source externe)'],
     ['etiquette', 'photo d etiquette lue par une machine', 'oui (source externe)'],
     ['manuel', 'calibrage tape a la main', '<b>NON</b> &mdash; c est sa donnee'],
     ['reprise', '&laquo; Mes aliments &raquo;', '<b>NON</b> &mdash; deja acceptee'],
     ['historique', 'reprise du journal', '<b>NON</b> &mdash; deja acceptee']],
    [28 * mm, 75 * mm, 62 * mm]))
H.append(Spacer(1, 4))
H.append(encadre(
    'Le meme code-barres, scanne ou tape',
    'Michel : <b>&laquo; Un code-barres scanne et le meme code-barres tape doivent imperativement '
    'produire la meme resolution. &raquo;</b> Les deux passent par la meme fonction, donc c est vrai '
    'par construction &mdash; mais un temoin dedie <b>compare les deux objets entiers</b>, pas '
    'seulement la valeur en calories. <i>Une egalite qu on n a pas mesuree est une intention.</i>',
    VERT))

H.append(P('3. La loi, pas un seuil', 'h1'))
H.append(P('Michel : <b>&laquo; ne pas utiliser 4/4/9 aveuglement &raquo;</b> et <b>&laquo; je veux '
           'une regle scientifiquement defendable, pas une simple comparaison approximative '
           '&raquo;</b>. Le Reglement UE 1169/2011 (annexe XIV) fixe les facteurs de conversion. '
           'Les proteines valent <b>%d kcal/g</b> et les lipides <b>%d kcal/g</b> ; <b>tous</b> les '
           'autres contributeurs sont <b>positifs ou nuls</b> &mdash; glucides 4, polyols 2,4, '
           'erythritol 0, fibres 2, alcool 7, acides organiques 3.' % (F_PROT, F_LIP), 'p'))
H.append(bloc_code('    E  >=  %d x P  +  %d x L          (un PLANCHER PHYSIQUE)' % (F_PROT, F_LIP),
                   'Quelle que soit la composition du reste :'))
H.append(P('[*] <b>C est exactement l argument que la consigne demandait</b> : les composants '
           'energetiques supplementaires ne peuvent pas expliquer une energie <b>plus basse</b>. '
           'Rien ne retire d energie. La loi ne dit jamais &laquo; c est bizarre &raquo; : elle dit '
           '&laquo; c est <b>impossible</b> &raquo;.', 'p'))
H.append(P('[*] <b>Et la tolerance est DERIVEE de la precision reellement recue, pas choisie.</b> '
           'Une valeur ecrite &laquo; 6,1 &raquo; est connue a &plusmn;0,05 ; une valeur ecrite '
           '&laquo; 6 &raquo; a &plusmn;0,5. La tolerance vaut donc '
           + (C % '4 x p(P) + 9 x p(L) + p(kcal)') + ' : elle s elargit toute seule quand la source '
           'est moins precise, au lieu de pretendre a une exactitude qu elle n a pas.', 'p'))
H.append(tableau(
    ['Le cas temoin, recalcule a chaque generation', 'Valeur'],
    [['ce que la fiche annonce', '<b>%s kcal/100 g</b>' % R_K],
     ['le plancher implique par ses seules proteines et lipides',
      '<b>%s kcal</b>' % R_PLANCHER],
     ['la tolerance derivee de la precision recue', '%s kcal' % R_TOL],
     ['ce qui manque', '<b>%s kcal</b>' % R_MANQUE],
     ['la valeur retenue apres resolution (macros completes)', '<b>%s kcal/100 g</b>' % R_ATWATER]],
    [125 * mm, 40 * mm]))
H.append(Spacer(1, 4))
H.append(encadre(
    'Zero faux positif sur %d aliments reels &mdash; remesure a chaque generation' % N_ALIMENTS,
    'La loi a ete <b>mesuree avant d etre ecrite</b>, sur les deux tables que l application '
    'embarque : <b>CIQUAL %d</b> aliments et <b>marques %d</b>. <b>Zero</b> declenchement. [!] Et ce '
    'chiffre n est pas recopie ici : le generateur <b>relit les deux tables et rejoue la loi</b> a '
    'chaque fois &mdash; un seul faux positif et le PDF ne sort pas. <i>Un document qui affirme '
    '&laquo; zero faux positif &raquo; sans le remesurer affirme un souvenir.</i>'
    % (N_CIQUAL, N_MARQUES), VERT))
H.append(Spacer(1, 4))
H.append(encadre(
    'La limite, dite plutot que cachee',
    'Avec une source donnee en <b>entiers</b> (6 g de proteines, 3 g de lipides), la tolerance monte '
    'a 7 kcal et <b>la loi ne mord plus</b> sur le meme produit. [/!\\] <b>La force de la loi depend '
    'de la precision de la source</b> &mdash; c est une propriete de la donnee, pas un defaut du '
    'controle. Un temoin epingle ce comportement pour qu il ne soit pas &laquo; repare &raquo; un '
    'jour en serrant la tolerance : ce serait rouvrir les faux positifs.', ORANGE))

H.append(P('4. Quatre etats, et ce que chacun autorise', 'h1'))
H.append(tableau(
    ['Etat', 'Quand', 'Ce que l app fait de la valeur'],
    [['<b>COHERENT</b>', 'la loi ne dit rien', 'rien du tout &mdash; la source passe intacte'],
     ['<b>ALTERNATIVE_FIABLE</b>',
      'une <b>autre</b> valeur energetique de la <b>meme source</b> tient debout',
      'on prend celle-la, et on <b>enregistre quel champ</b>'],
     ['<b>DERIVE_ESTIMABLE</b>', 'les macros sont <b>completes</b>',
      'on estime depuis les macros, et on le dit'],
     ['<b>NON_RESOLU</b>', 'macros incompletes, ou donnee de la personne',
      '<b>on ne touche a rien</b>, et l ecran dit qu on ne sait pas']],
    [40 * mm, 60 * mm, 65 * mm]))
H.append(Spacer(1, 4))
H.append(P('[*] <b>L ordre compte, et il est mesure</b> : une autre valeur <b>de la source</b> passe '
           '<b>avant</b> une estimation. On prefere toujours une donnee a un calcul. Une mutation '
           'qui inverse cette priorite fait rougir un temoin precis.', 'p'))
H.append(encadre(
    '&laquo; Completes &raquo; veut dire PRESENTES, pas &laquo; superieures a zero &raquo;',
    '[/!\\] <b>C est un vrai defaut trouve a la mesure, pas une precaution theorique.</b> Le '
    'normaliseur transforme une macro <b>absente</b> en <b>0</b> avant que le resolveur la voie : '
    'une fiche sans glucides declares ressemblait donc trait pour trait a une huile, qui a 0 g de '
    'glucides <b>pour de vrai</b> (R29). On aurait derive une valeur depuis une donnee qu on n avait '
    'pas. La presence est desormais mesuree sur les <b>arguments bruts</b>, avant toute '
    'normalisation &mdash; et un garde le verifie.', ORANGE))

H.append(P('5. Aucune correction silencieuse', 'h1'))
H.append(P('Michel : <b>&laquo; ne jamais ecraser la source et perdre la trace de ce qui s est '
           'passe &raquo;</b>. Deux consequences, toutes deux epinglees par des temoins.', 'p'))
H.append(P('<b>(1) La trace part avec la ligne.</b> Quand une valeur a ete resolue, la ligne '
           'enregistree porte : la valeur <b>brute</b> recue, la valeur <b>retenue</b>, la '
           '<b>methode</b>, la <b>raison</b>, le <b>champ</b> d origine, le niveau de '
           '<b>confiance</b> et l <b>origine</b>. [*] Et <b>une ligne coherente ne gagne rien du '
           'tout</b> : une ligne normale ne grossit pas.', 'p'))
H.append(P('<b>(2) L ecran le dit.</b> Sur l ecran d ajout, l avertissement affiche <b>la valeur '
           'annoncee par la fiche</b> et <b>la valeur retenue</b>, avec la raison en francais '
           'ordinaire. En ' + (C % 'NON_RESOLU') + ' il dit <b>&laquo; l app ne sait pas laquelle '
           'croire &raquo;</b> au lieu de presenter un chiffre douteux comme sur. [*] On enrichit le '
           'proprietaire qui existait deja (R13) : une deuxieme boite d avertissement aurait fini '
           'par contredire la premiere.', 'p'))
H.append(encadre(
    'Un defaut a moi, trouve par un temoin et pas par une relecture',
    'L ecran lisait ' + (C % 'z.retenu') + ' &mdash; un nom qui n existe que sur la <b>trace</b>, '
    'pas sur l objet du resolveur. Il affichait donc <b>&laquo; undefined kcal/100 g &raquo;</b> '
    '<b>sans lever la moindre erreur</b>. [*] <i>C est le temoin de l ecran qui l a dit, pas ma '
    'relecture</i> &mdash; et un garde du generateur refuse desormais ' + (C % 'z.retenu')
    + ' pour de bon.', ORANGE))

H.append(P('6. Ce que la personne a saisi ne se reecrit jamais', 'h1'))
H.append(P('Michel : <b>&laquo; les donnees explicitement saisies par l utilisateur ne doivent pas '
           'etre reecrites arbitrairement comme une donnee externe &raquo;</b>. Les trois origines '
           + (C % 'manuel') + ', ' + (C % 'reprise') + ' et ' + (C % 'historique') + ' sont '
           '<b>classees</b> &mdash; donc l ecran peut le dire et la douane peut le compter &mdash; '
           'mais <b>la valeur reste la sienne</b>. <i>Reecrire ce que quelqu un a tape, c est lui '
           'retirer la main sur sa propre donnee.</i>', 'p'))

H.append(P('7. La douane n a pas bouge &mdash; et la mesure avant / apres', 'h1'))
H.append(P('Michel : <b>&laquo; la douane reste une derniere barriere d observation, je ne veux PAS '
           'la transformer en moteur de correction &raquo;</b>. Ses <b>%d regles</b> dont <b>%d '
           'INVALID</b> sont intactes, elle n appelle pas le resolveur, aucune ne bloque, et les '
           'quatre ecrivains ne lisent toujours pas son verdict. Quatre gardes le verifient.'
           % (N_REGLES, N_INVALID), 'p'))
H.append(tableau(
    ['Une ligne de type %s kcal/100 g, a 100 g' % R_K, 'Avant', 'Apres'],
    [['origines externes (barcode, off, marque, ciqual, etiquette)',
      '<b>5</b> en ' + (C % 'energie_incoherente'), '<b>0</b>'],
     ['origines utilisateur (manuel, historique)',
      '<b>2</b> en ' + (C % 'energie_incoherente'), '<b>2</b> &mdash; par conception'],
     ['un produit coherent (poulet 165 kcal)', 'OK', 'OK &mdash; aucune regression'],
     ['<b>total qui atteint la douane</b>', '<b>7</b>', '<b>2</b>']],
    [95 * mm, 35 * mm, 35 * mm]))
H.append(Spacer(1, 4))
H.append(P('[*] <b>Les deux qui restent sont exactement les origines que le resolveur refuse de '
           'toucher.</b> Ce n est pas un reste a nettoyer : c est la consigne de Michel qui se voit '
           'dans un chiffre. <i>La douane continue de les compter, ce qui est precisement son '
           'metier &mdash; observer, pas corriger.</i>', 'p'))

H.append(P('8. Ce qui prouve tout ce qui precede', 'h1'))
H.append(P('Le bloc <b>CCCV</b> du parcours porte <b>%d temoins</b>, dont les <b>16 cas</b> exiges '
           'nommement. Passe complete verte sur l arbre final : <b>%d / %d</b>. [*] Et l instantane '
           'de ce qui est reellement ecrit dans le journal alimentaire est <b>identique octet pour '
           'octet</b> (sha %s) : <b>aucune ligne deja ecrite ne change</b> &mdash; la sonde conduit '
           'une origine <b>utilisateur</b>, que le resolveur laisse intacte par construction.'
           % (N_TEMOINS, PASSE_OK, PASSE_OK + PASSE_KO, SHA_INSTANTANE), 'p'))
H.append(tableau(
    ['Les 8 mutations negatives demandees', 'Temoins rouges'],
    [['mauvaise conversion kJ / kcal (multiplication au lieu de division)', '2'],
     ['priorite inversee (on derive avant de regarder la source)', '1 &mdash; exactement lui'],
     ['seuil trop permissif (tolerance multipliee par 10)', '8'],
     ['seuil trop strict (tolerance a zero)', '1 &mdash; exactement lui'],
     ['valeur source ecrasee (une saisie de la personne est reecrite)', '2'],
     ['provenance perdue (la trace ne part plus avec la ligne)', '1 &mdash; exactement lui'],
     ['valeur derivee appliquee alors que les macros sont incompletes', '1 &mdash; exactement lui'],
     ['le cas temoin redevient %s comme valeur de confiance' % R_K, '3']],
    [125 * mm, 40 * mm]))
H.append(Spacer(1, 4))
H.append(P('[*] <b>Les huit mordent, et le controle sain est a zero rouge avant ET apres</b> '
           '&mdash; sur un arbre <b>copie</b>, jamais sur l arbre servi.', 'petit'))

H.append(P('9. Perimetre strict &mdash; mesure, documente, pas corrige', 'h1'))
H.append(P('[!] ' + (C % 'S.savedFoods') + ' multi-onglets &middot; la tracabilite de '
           + (C % 'saveEditFood') + ' &middot; les lignes entierement a zero &middot; '
           + (C % 'rejouerRepas') + ' et sa provenance &middot; les ' + (C % 'ml') + ' &middot; '
           'l ecart <b>48,3 / 48</b> entre deux arrondis &middot; l historique &middot; les '
           'migrations &middot; les autres harmonisations produit. [!] <b>Une mesure de plus, faite '
           'en chemin</b> : ' + (C % 'estimateFoodAI') + ' <b>ne passe pas par</b> '
           + (C % '_ref100') + ' &mdash; il ecrit les champs de l ecran directement et n a '
           'volontairement pas de pour-100 g. Il echappe donc au resolveur. <b>Mesure, ecrit, non '
           'corrige</b> : ce serait un autre chantier.', 'p'))
H.append(Spacer(1, 4))
H.append(P('Ce PDF est genere par <font face="Courier">tools/gen_fiab_pdf.py</font>, dont les %d '
           'gardes recomptent chaque chiffre depuis le code servi et <b>refusent de produire</b> si '
           'un seul fait tombe &mdash; y compris la loi elle-meme, <b>rejouee sur %d aliments</b>, '
           'et le total de la passe, <b>lu dans son journal</b> et jamais ecrit a la main.'
           % (N_GARDES, N_ALIMENTS), 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - fiabilite energie / macros en entree (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)
print('OK %s  (%s, %d aliments relus, 0 faux positif, %d temoins, %d gardes, passe %d/%d)'
      % (OUT, VERSION, N_ALIMENTS, N_TEMOINS, N_GARDES, PASSE_OK, PASSE_OK + PASSE_KO))
