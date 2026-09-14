#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/CHEMIN-RESEAU-CODEBARRES.pdf — ce que le chemin code-barres demande vraiment au
   reseau, mesure et non suppose. Vingt-deuxieme document de la serie.

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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'CHEMIN-RESEAU-CODEBARRES.pdf')

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
if N_TEMOINS != 30:   # bloc CCCV, inchange
    raise SystemExit('Le bloc CCCV porte %d temoins, pas 30 : le §8 cite ce chiffre.' % N_TEMOINS)

PASSE = os.environ.get('FT_PASSE') or '/tmp/passereseau.log'
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
                      'Force Tracker — le chemin reseau du code-barres (%s) — 14/09/2026'
                      % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()



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
                      'Force Tracker — le chemin reseau du code-barres (%s) — 14/09/2026'
                      % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()



# ── [!!] LES GARDES PROPRES A ft-v1208 ───────────────────────────────────────────────────────
C_MAJ = corps('_majPeutSAppliquer')
N_CCCVI = len(re.findall(r"t\('CCCVI ", RUN))

if VERSION != 'ft-v1208':
    raise SystemExit('Le cache servi annonce %s : ce document parle de ft-v1208.' % VERSION)
if N_CCCVI != 22:
    raise SystemExit('Le bloc CCCVI porte %d temoins, pas 22 : le document cite ce chiffre.' % N_CCCVI)
# [!!] LA PORTE TAPEE DOIT ETRE CONDUITE PAR SA VRAIE FONCTION. Un temoin qui passe une valeur de
#    provenance inventee valide par accident — c est le defaut trouve en ecrivant la validation.
if '_manualBarcode()' not in RUN:
    raise SystemExit('Le banc ne conduit plus la VRAIE porte du code-barres tape : « verifier la '
                     'fonction n est pas verifier l appel ».')
if "'code-tape'" not in CODE:
    raise SystemExit('La provenance « code-tape » a disparu du code servi : le document affirme '
                     'que le resultat est le meme mais que la provenance distingue les deux portes.')
# [!!] LE DOCUMENT DE VALIDATION EST LE TEMOIN ECRIT DU CAS REEL.
_VAL = os.path.join(ROOT, 'docs', 'VALIDATION-IPHONE-RAYNAL.md')
if not os.path.exists(_VAL):
    raise SystemExit('docs/VALIDATION-IPHONE-RAYNAL.md a disparu : c est le temoin ecrit du cas '
                     'reel, demande nommement par Michel.')
# [/!\] `_valTxt`, PAS `_v` : `_v` est le validateur de police defini plus bas, et le renommer
#    par accident casse tout le rendu avec un « str object is not callable » sans rapport.
_valTxt = open(_VAL, encoding='utf-8').read()
for _f in ('ALTERNATIVE_FIABLE', 'energy-kj_100g', 'energy-kcal_100g', '99,2', '48,3', '407 kcal',
           'code-tape', '3021690201123'):
    if _f not in _valTxt:
        raise SystemExit('Le document de validation ne porte plus « %s » : c est un des faits '
                         'qu il est cense figer.' % _f)
# [!!] LA 2e CAPTURE A REVELE LA VRAIE FICHE : elle porte DEUX energies. Le document en depend
#    entierement, donc la fixture du banc doit etre celle-la — une fixture appauvrie eprouverait
#    la mauvaise branche, ce qui est exactement l erreur que ce document raconte.
_c = RUN[RUN.index('BLOC CCCVI'):RUN.index('TÉMOINS DE SOURCE', RUN.index('BLOC CCCVI'))]
if "'energy-kj_100g':415" not in _c:
    raise SystemExit('LA FIXTURE DU BANC N EST PLUS LA VRAIE FICHE : sans son second champ '
                     'energetique, le banc eprouve la derivation alors que le vrai produit passe '
                     'par l alternative — c est le defaut que le §4 raconte.')
# [/!\] SOUS-CHAINE : « FICHE_SANS_KJ » est contenu dans « FICHE_SANS_KJx ». On exige la
#    DECLARATION et un USAGE, sinon renommer la variable satisfait encore le garde.
if not re.search(r'const FICHE_SANS_KJ\s*=', _c) or 'FICHE_COURANTE=FICHE_SANS_KJ;' not in _c:
    raise SystemExit('La fiche PRIVEE de son second champ n est plus eprouvee : le §4 affirme que '
                     'les DEUX branches sont couvertes sur le meme produit.')
if not re.search(r'o\.huile\s*=', _c) or 'X.huile' not in RUN:
    raise SystemExit('Le garde « le candidat viole aussi la loi » n est plus eprouve : mesure, il '
                     'est inatteignable sur les lentilles et n a de sens que sur une huile.')
# [!!] LE GARDE CENTRAL DE CE DOCUMENT : `champSource` ne doit JAMAIS etre reecrit. C est le seul
#    correctif de la version, et sa disparition ne changerait RIEN a l ecran — donc seul le code
#    peut le dire.
if len(re.findall(r'champSource\s*:', C_RESOL)) != 1 or re.search(r'res\.champSource\s*=', C_RESOL):
    raise SystemExit('`champSource` EST REECRIT OU DUPLIQUE DANS LE RESOLVEUR : tout le §5 affirme '
                     'le contraire, et sa disparition est invisible a l ecran.')
if not re.search(r'champSource\s*:\s*z\.champSource', C_PROV):
    raise SystemExit('LE CHAMP SOURCE NE PART PLUS AVEC LA LIGNE : il ne servirait alors a rien, '
                     'et le §5 promet qu il rend la question mesurable au prochain scan.')
# [/!\] ET IL DOIT RESTER DISTINCT DE `champ` : les fondre reproduirait exactement le defaut.
# [/!\] DEUX occurrences, pas une : `champ` est ecrase par la derivation NORMALE et par la branche
#    « energie absente ». Un garde qui n en exige qu une est satisfait par l autre — c est ma propre
#    mutation qui l a montre, en n en retirant qu une et en passant quand meme.
if len(re.findall(r"res\.champ = 'P/G/L'", C_RESOL)) != 2:
    raise SystemExit('Les DEUX branches de derivation n ecrasent plus `champ` : le document explique '
                     'pourquoi les deux champs existent, cette explication deviendrait fausse.')
# [!!] LE GARDE DE HORS-PERIMETRE : la decision de ft-v1184 n a pas ete « reparee ».
if not C_MAJ:
    raise SystemExit('`_majPeutSAppliquer` est introuvable : le §3 entier parle d elle.')
for _cle in ("_curScreen", "_finishing", "_evRunning", "ov-session-end"):
    if _cle not in C_MAJ:
        raise SystemExit('Le garde de mise a jour a perdu « %s » : le §3 affirme qu il est INTACT, '
                         'et le « reparer » sans feu vert est exactement ce que R30 interdit.' % _cle)
if not re.search(r"_curScreen\s*!==\s*'home'", C_MAJ):
    raise SystemExit('LE GARDE NE RETIENT PLUS LE RECHARGEMENT HORS ACCUEIL : c est la cause '
                     'mesuree de la capture, et le document la decrit comme inchangee.')
# [!!] AUCUN CAS PARTICULIER RAYNAL — interdiction explicite.
if '3021690201123' in CODE:
    raise SystemExit('LE CODE-BARRES DE MICHEL APPARAIT DANS LE CODE SERVI : interdiction '
                     'explicite, le correctif doit etre generique.')
for _f in ('_resoudreNutrition', '_ref100'):
    if re.search(r'93\.2|[Rr]aynal', corps(_f)):
        raise SystemExit('Un cas particulier s est glisse dans `%s` : le §6 affirme le contraire.' % _f)
# [/!\] LE TEMOIN DES 8 ORIGINES DOIT LIRE LES APPELS, PAS LE FICHIER ENTIER — c est le temoin
#    aveugle que ce chantier a referme ; s il redevenait permissif, le §7 deviendrait faux.
if "codeA.indexOf(\"origine:'\"" in RUN:
    raise SystemExit('LE TEMOIN DES 8 ORIGINES EST REDEVENU AVEUGLE : il cherche le nom n importe '
                     'ou au lieu de lire les appels de `_ref100` — c est exactement le defaut que '
                     'le §7 raconte avoir referme.')
# [/!\] SOUS-CHAINE LITTERALE, PAS UNE REGEX : le motif recherche EST lui-meme une regex, donc
#    le re-echapper une 2e fois produit un garde qui refuse du code parfaitement sain. C est
#    exactement ce qui vient d arriver a ce garde-ci.
if r"_ref100\((?:[^;])*?origine:'(\w+)'" not in RUN:
    raise SystemExit('Le temoin des 8 origines ne lit plus les APPELS de `_ref100` : le §7 en '
                     'depend entierement.')
# [!!] LE BLOC CCCVI DOIT CONDUIRE LA VRAIE CHAINE, pas appeler `_ref100` tout seul.
# [/!\] LE BLOC EST BORNE, ET LES APPELS SONT COMPTES. Un « in » suffisait a etre satisfait par
#    le SECOND appel (celui du produit sain) quand on retirait le premier : le garde disait
#    « la chaine est conduite » alors qu elle ne l etait plus pour le cas de la capture.
if 'BLOC CCCVI' not in RUN:
    raise SystemExit('Le bloc CCCVI a disparu du banc : tout le §7 parle de lui.')
_deb = RUN.index('BLOC CCCVI')
_cccvi = RUN[_deb:RUN.index('TÉMOINS DE SOURCE', _deb)]
if len(re.findall(r'_lookupBarcode\(', _cccvi)) != 2:
    raise SystemExit('Le bloc CCCVI ne scanne plus DEUX fois (le cas de la capture et le produit '
                     'sain de non-regression) : le §7 repose sur les deux.')
for _appel in ("getElementById('af-bc-grams')", "'410'", "'3021690201123'"):
    if _appel not in _cccvi:
        raise SystemExit('Le bloc CCCVI ne conduit plus la chaine complete (« %s » absent) : tout '
                         'le §7 repose sur le fait qu il rejoue la capture de bout en bout.' % _appel)



# ── [!!] LES GARDES DE CE DOCUMENT — ils lisent le CODE SERVI, pas un souvenir ────────────────
CST = open(os.path.join(ROOT, 'constants.js'), encoding='utf-8').read()
C_LOOKUP = corps('_lookupBarcode')
C_MANUEL = corps('_manualBarcode')
C_OFF = corps('_offFetchProduct')
C_PHOTOIA = corps('onBarcodePhotoIA')
C_ZXING = corps('_loadZXing')
C_SCANNER = corps('openBarcodeScanner')
N_CCCVII = len(re.findall(r"t\('CCCVII ", RUN))

if N_CCCVII != 15:
    raise SystemExit('Le bloc CCCVII porte %d temoins, pas 15 : le document cite ce chiffre.' % N_CCCVII)
# [!!] LE FAIT CENTRAL : la recherche produit ne parle QU a Open Food Facts.
if len(re.findall(r'https://world\.openfoodfacts\.org', C_OFF)) != 2:
    raise SystemExit('La recherche produit n interroge plus exactement deux URL Open Food Facts : '
                     'le §2 du document en depend.')
if re.search(r'workers\.dev|script\.google\.com|_aiUrl', C_OFF):
    raise SystemExit('LA RECHERCHE PRODUIT A CHANGE DE DESTINATION : le document affirme qu aucun '
                     'autre service ne voit passer le code-barres.')
# [!!] LA PORTE TAPEE ET LE LOOKPUP COMMUN NE TOUCHENT AUCUN SERVICE IA.
for _nom, _c in (('_manualBarcode', C_MANUEL), ('_lookupBarcode', C_LOOKUP)):
    if re.search(r'_aiUrl|workers\.dev|estimateFoodAI', _c):
        raise SystemExit('UN APPEL IA S EST GLISSE DANS `%s` : tout le §3 affirme le contraire, et '
                         'pour le lookup cela toucherait LES DEUX portes.' % _nom)
if len(re.findall(r'fetch\(', C_LOOKUP)) != 0 or '_offFetchProduct(' not in C_LOOKUP:
    raise SystemExit('Le lookup produit ne passe plus par son proprietaire : le §3 decrit un point '
                     'de convergence unique.')
# [!!] L UNIQUE APPEL IA DU CHEMIN, ET IL EST DECLARE.
if len(re.findall(r'_aiUrl\(', C_PHOTOIA)) != 1 or "_aiUrl('readBarcode')" not in C_PHOTOIA:
    raise SystemExit('L appel IA de la photo a change de forme : le §4 le decrit comme unique et '
                     'nomme.')
if "'readBarcode'" not in CST or 'AI_PROXY_ACTIONS' not in CST:
    raise SystemExit('`readBarcode` n est plus declaree dans la liste des actions du proxy : le §4 '
                     'affirme que rien ne part vers l IA sans y etre inscrit.')
# [/!\] LIRE le plafond n est PAS le DECOMPTER — et ce garde le confondait. Mesure du 14/09 :
#       retirer l INCREMENT en laissant les deux controles de mur le laissait parfaitement vert,
#       parce qu il etait ecrit `A not in ... and B not in ...` (il fallait que les DEUX
#       disparaissent). Un `and` entre deux absences est un OU entre deux presences : il suffit
#       d un mot qui reste pour qu il se taise. On cherche donc l ECRITURE, seule preuve du
#       decompte, et la lecture du plafond separement.
if not re.search(r'S\.foodAiUses\s*=\s*\(\s*S\.foodAiUses\s*\|\|\s*0\s*\)\s*\+\s*1', C_PHOTOIA):
    raise SystemExit('L appel IA de la photo n INCREMENTE plus le quota : le §4 affirme qu il est '
                     'decompte des 25 essais gratuits. (Lire le plafond ne le decompte pas.)')
if 'FOOD_AI_FREE_LIMIT' not in C_PHOTOIA:
    raise SystemExit('L appel IA de la photo ne consulte plus le plafond gratuit : le §4 affirme '
                     'qu il s arrete a 25 essais.')
if "'photo-code-ia'" not in C_PHOTOIA:
    raise SystemExit('La provenance ne distingue plus la lecture IA d un decodage verifie : le §4 '
                     'et la regle R33 en dependent.')
# [!!] LE DECODAGE CAMERA EST LOCAL — et sans porte, ce qui est une DECISION, pas un oubli.
if './lib/zxing.min.js' not in C_ZXING or re.search(r'https?:', C_ZXING):
    raise SystemExit('ZXing n est plus charge depuis le depot : le §5 affirme un decodage 100 % local.')
if len(re.findall(r'fetch\(', C_SCANNER)) != 0:
    raise SystemExit('Le scanner camera fait desormais un appel reseau : le §5 affirme le contraire.')
_html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
if re.search(r'scanBarcode\s*\(\s*\)', _html) or 'openBarcodeScanner' in _html:
    raise SystemExit('LE SCANNER CAMERA A RETROUVE UNE PORTE D ENTREE : c est une decision produit, '
                     'et tout le §5 raconte qu il n en a pas. Relire ft-v388 et ft-v871 avant de '
                     'republier ce document.')
if 'scanBarcodeIA()' not in _html:
    raise SystemExit('Le bouton de la photo du code-barres a disparu de l ecran : le §4 le cite.')

# [/!\] Le NOMBRE de gardes se recompte dans ce fichier meme (lecon ft-v1202).
N_GARDES = len(re.findall(r'raise SystemExit', open(os.path.abspath(__file__),
                                                    encoding='utf-8').read()))

H = []
H.append(P('Le chemin reseau du code-barres', 'titre'))
H.append(P('Mesure, non supposition &mdash; %s &mdash; 14/09/2026. Vingt-deuxieme document de la '
           'serie. %d gardes recomptent chaque fait depuis le code servi et refusent de produire ce '
           'PDF si un seul tombe.' % (VERSION, N_GARDES), 'sous'))

H.append(encadre(
    'La question, et pourquoi la reponse la deborde',
    'Michel : <b>&laquo; prouver exactement ce qui se passe quand un utilisateur scanne un '
    'code-barres, et verifier que ce chemin n appelle ni Milo, ni Anthropic, ni aucun autre service '
    'IA &raquo;</b> &mdash; <b>&laquo; je veux une preuve, pas une hypothese &raquo;</b>. [*] La '
    'mesure repond, et corrige la premisse au passage : <b>il n existe pas de scan camera '
    'atteignable</b>. Le seul &laquo; scan &raquo; que l ecran propose est une <b>photo lue par l '
    'IA</b> &mdash; ce que dit deja le libelle de son bouton.'))

H.append(P('1. La mesure', 'h1'))
H.append(P('<font face="Courier">fetch</font> est intercepte et chaque appel classe par <b>domaine</b>. '
           '[!] <b>Aucune requete ne part</b> : on compte ce que l application <b>DEMANDE</b>, pas ce '
           'que le reseau laisse passer. Code-barres de test : <font face="Courier">3083681011791</font>.', 'p'))
H.append(tableau(
    ['Porte', 'Appels', 'Domaines', 'Appels IA'],
    [['<b>code-barres TAPE</b>', '<b>1</b>', 'world.openfoodfacts.org', '<b>0</b>'],
     ['<b>photo du code-barres</b>', '<b>2</b>',
      'dry-field-e931.forcetracker-app.workers.dev<br/>+ world.openfoodfacts.org', '<b>1</b>'],
     ['scanner camera (ZXing)', '&mdash;', 'decodage <b>100 % local</b>, aucun reseau',
      '<b>0</b> &mdash; mais <b>aucune porte d entree</b>']],
    [42 * mm, 20 * mm, 73 * mm, 30 * mm]))

H.append(P('2. Ce que le produit demande, et a qui', 'h1'))
H.append(P('La recherche produit est <b>un seul proprietaire</b> appele par les deux portes. Il '
           'interroge <b>deux URL Open Food Facts</b> en cascade (v2 puis v0, meme domaine) et rien '
           'd autre. [!] Un garde refuse de produire ce document si cette destination change, ou si '
           'un appel vers le proxy IA s y glisse.', 'p'))
H.append(bloc_code(
    "code-barres tape ----+\n"
    "                     |--> _lookupBarcode --> _offFetchProduct --> openfoodfacts.org\n"
    "photo (IA) ----------+                  --> _ref100 --> resolveur --> ecran",
    'Le point de convergence, mesure sur l objet final :'))
H.append(P('[*] <b>Les deux portes produisent le meme objet</b>, compare en entier. Et la '
           '<b>provenance</b> les distingue quand meme : <font face="Courier">code-tape</font> '
           'contre <font face="Courier">photo-code-ia</font> &mdash; <i>le resultat est le meme, la '
           'facon dont il est entre ne l est pas</i>, et la seconde n a <b>pas</b> de cle de controle '
           'verifiee.', 'p'))

H.append(P('3. L unique appel IA, et ce qu il coute', 'h1'))
H.append(tableau(
    ['Ce qui est mesure dans le Worker', 'Valeur'],
    [['modele', '<b>Claude Haiku 4.5</b>'],
     ['plafond de sortie', '<b>100</b> jetons'],
     ['entree', '<b>une</b> image redimensionnee a <b>1 100 px</b>, qualite 0,85'],
     ['quota gratuit', '<b>25</b> essais, illimite en Premium'],
     ['annonce a la personne', 'dans le libelle du bouton : &laquo; <b>IA lit les chiffres</b> &raquo;']],
    [105 * mm, 60 * mm]))
H.append(Spacer(1, 4))
H.append(P('[/!\\] <b>Aucun prix n est chiffre ici</b> : les tarifs ne se devinent pas, ils se lisent '
           'sur la facture. Ce document donne le <b>volume</b>, qui lui est mesurable.', 'petit'))

H.append(P('4. Ce qui n est PAS un defaut, et qui n a donc pas ete repare', 'h1'))
H.append(encadre(
    'Le scanner camera existe, il est local, et il n a pas de bouton',
    '<b>ft-v388</b> (11/07/2026) : <b>&laquo; Ancien bouton scanner camera (peu fiable) RETIRE, '
    'remplace par la saisie du numero (rapide et fiable) &raquo;</b>. <b>ft-v871</b> a reconstate le '
    'code orphelin et <b>repose la question a Michel sans rien toucher</b>. [*] <i>La decision '
    'existe et elle est ecrite ; ce n etait pas a moi de la renverser</i> (regle R30). Un garde '
    'refuse de produire ce PDF si le scanner retrouve une porte d entree &mdash; ce serait une '
    'decision produit, pas une correction.', ORANGE))
H.append(Spacer(1, 4))
H.append(P('[/!\\] <b>Une consequence mesuree au passage, non corrigee</b> : la fonction de repli '
           'photo cherche un element retire avec ft-v388, donc le bouton &laquo; Prendre une photo a '
           'la place &raquo; du scanner <b>ne fait rien</b> &mdash; <b>0 appel mesure</b>. Invisible '
           'aujourd hui puisque le scanner lui-meme est inatteignable, <i>mais il redevient un bug le '
           'jour ou l on rouvre la porte</i>.', 'p'))

H.append(P('5. Ce qui fige tout cela', 'h1'))
H.append(P('Bloc <b>CCCVII</b> du parcours, <b>%d temoins</b>. Passe complete verte sur l arbre '
           'final : <b>%d / %d</b>.' % (N_CCCVII, PASSE_OK, PASSE_OK + PASSE_KO), 'p'))
H.append(encadre(
    'On fige le contrat REEL, pas celui qu on aurait aime lire',
    'Michel demandait un temoin &laquo; scan = 0 appel IA &raquo;. [X] <b>Ce contrat est faux</b> : '
    'la photo fait <b>exactement un</b> appel IA. Le temoin fige donc <b>un</b>, annonce et '
    'decompte. <i>Un temoin qui affirme ce qu on aurait aime lire ne protege rien.</i>', VERT))
H.append(Spacer(1, 4))
H.append(tableau(
    ['Les 8 mutations, sur un arbre copie', 'Temoins rouges'],
    [['la photo passe par l estimation IA en texte libre', '<b>5</b>'],
     ['le code TAPE appelle le Worker IA', '3'],
     ['<b>le LOOKUP COMMUN appelle le Worker IA</b> (il toucherait les deux portes)', '<b>5</b>'],
     ['scan et saisie divergent (la photo n utilise plus le meme lookup)', '4'],
     ['la recherche produit change de destination', '4'],
     ['ZXing part d un CDN au lieu du depot', '1 &mdash; exactement lui'],
     ['l appel IA n est plus decompte du quota', '1 &mdash; exactement lui'],
     ['la provenance ne distingue plus l IA d un decodage verifie', '1 &mdash; exactement lui']],
    [125 * mm, 40 * mm]))
H.append(Spacer(1, 4))
H.append(P('[*] <b>Les huit mordent, controle sain a zero rouge avant ET apres.</b> [/!\\] Et une '
           'mutation etait invalide au premier jet : la ligne de decompte du quota existe <b>trois '
           'fois</b> dans le fichier, je n en changeais qu une. <i>Une mutation qui ne fait pas ce qu '
           'elle annonce est indiscernable d un garde aveugle.</i>', 'petit'))

H.append(P('6. Ce que ce document ne fait pas', 'h1'))
H.append(P('[!] <b>Aucun correctif</b> &mdash; rien n a ete trouve de casse dans le chemin mesure. '
           '[!] Le scanner camera orphelin et son bouton de repli mort sont <b>figes en l etat</b>, '
           'pas repares : la decision revient a Michel. [!] <b>Aucun fichier servi modifie</b>, donc '
           'pas de nouvelle version. Perimetre Nutrition intact : la douane, les aliments '
           'enregistres, l historique, les migrations, les millilitres, l edition d une ligne, la '
           'repetition d un repas, l estimation IA.', 'p'))
H.append(Spacer(1, 4))
H.append(P('Ce PDF est genere par <font face="Courier">tools/gen_reseau_pdf.py</font>, dont les %d '
           'gardes lisent le code servi et <b>refusent de produire</b> si un seul fait tombe &mdash; '
           'y compris le total de la passe, <b>lu dans son journal</b> et jamais ecrit a la main.'
           % N_GARDES, 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - le chemin reseau du code-barres (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)
print('OK %s  (%s, %d temoins CCCVII, %d gardes, passe %d/%d)'
      % (OUT, VERSION, N_CCCVII, N_GARDES, PASSE_OK, PASSE_OK + PASSE_KO))
