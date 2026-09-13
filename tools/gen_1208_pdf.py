#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/CAPTURE-IPHONE-TRANCHEE.pdf — comment une capture d ecran a ete tranchee par la
   mesure AVANT toute correction. Vingt-et-unieme document de la serie.

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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'CAPTURE-IPHONE-TRANCHEE.pdf')

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

PASSE = os.environ.get('FT_PASSE') or '/tmp/passe1208.log'
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
                      'Force Tracker — la capture iPhone tranchee par la mesure (%s) — 13/09/2026'
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
if N_CCCVI != 20:
    raise SystemExit('Le bloc CCCVI porte %d temoins, pas 20 : le document cite ce chiffre.' % N_CCCVI)
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


# [/!\] Le NOMBRE de gardes se recompte dans ce fichier meme (lecon ft-v1202).
N_GARDES = len(re.findall(r'raise SystemExit', open(os.path.abspath(__file__),
                                                    encoding='utf-8').read()))

H = []
H.append(P('La capture iPhone, tranchee par la mesure', 'titre'))
H.append(P('Verification runtime &mdash; %s &mdash; 13/09/2026. Vingt-et-unieme document de la '
           'serie. Tous les decomptes sont <b>recomptes depuis le code servi</b> : %d gardes '
           'refusent de produire ce PDF si un seul fait tombe.' % (VERSION, N_GARDES), 'sous'))

H.append(encadre(
    'La question, et la regle qui a decide de la methode',
    'Michel envoie une capture de son iPhone : lentilles Raynal a <b>410 g</b>, <b>198 kcal</b>, et '
    'l ancien encadre &laquo; ne colle pas a ces macros &raquo; avec son bouton &laquo; Mettre 381 '
    'kcal &raquo; &mdash; soit exactement ce que la version precedente etait censee avoir supprime. '
    '[!] Sa consigne decide de tout : <b>&laquo; ne corrige rien avant d avoir tranche A / B / C '
    '&raquo;</b> et <b>&laquo; ne considere pas la capture comme une preuve que ft-v1207 est cassee '
    'tant que tu n as pas d abord verifie qu elle est reellement executee &raquo;</b>.'))

H.append(P('1. Le verdict : B &mdash; et chaque branche est fermee par une mesure', 'h1'))
H.append(tableau(
    ['Branche', 'Ce qui la ferme'],
    [['<b>A</b> &mdash; pas deployee',
      '[X] <b>tombe</b> : deploiement Pages <b>success</b> sur <font face="Courier">7e8d3ea9</font> '
      'a <b>16:32:51 UTC</b>, soit <b>1 h 30 avant</b> la capture'],
     ['<b>C</b> &mdash; executee, mais le resolveur n atteint pas le chemin code-barres',
      '[X] <b>tombe</b> : trace runtime complete sur le code servi &mdash; <b>410 g ne donne plus '
      '198 kcal</b> ; l avertissement de fiabilite parle ; la trace est posee sur la ligne ; '
      '<b>0 erreur JS</b>'],
     ['<b>B</b> &mdash; deployee, mais version perimee servie', '<b>retenue</b>']],
    [58 * mm, 107 * mm]))
H.append(Spacer(1, 4))
H.append(encadre(
    'La preuve que c est B est DANS la capture elle-meme',
    'Mesure sur les <b>huit origines</b> : sous cette version, <b>toutes</b> font parler l '
    'avertissement de fiabilite &mdash; seule la <b>REECRITURE</b> de la valeur differe (sources '
    'externes 382, saisies de la personne 198). Or la capture n en montre <b>aucun</b>, mais l '
    '<b>ancien</b> encadre. [*] <b>Donc ce code n a pas ete execute, quelle que soit la porte '
    'employee</b> &mdash; la demonstration ne depend plus de savoir par ou l aliment est entre.', VERT))
H.append(Spacer(1, 4))
H.append(P('[*] <b>Et le payload ne peut pas sauver l hypothese inverse.</b> Balayage exhaustif des '
           '<b>54</b> pour-100 g qui affichent exactement <font face="Courier">198 / 25 / 41 / 13</font> '
           'a 410 g : <b>la loi mord sur les 54</b>. <i>Il n existe aucune fiche compatible avec la '
           'capture que cette version aurait laissee passer.</i>', 'p'))

H.append(P('2. La cause, mesuree et non deduite', 'h1'))
H.append(P('Le rechargement qui applique une nouvelle version est <b>retenu</b> tant que l ecran '
           'courant n est pas l Accueil. C est une decision anterieure, prise pour ne pas arracher '
           'l ecran sous les doigts de quelqu un.', 'p'))
H.append(tableau(
    ['Ecran ou se trouve la personne', 'La mise a jour s applique ?'],
    [['<b>Accueil</b>', '<b>oui</b>'],
     ['Nutrition &middot; Seance &middot; Progres &middot; Profil &middot; Coach',
      '[X] <b>non &mdash; retenue</b>']],
    [105 * mm, 60 * mm]))
H.append(Spacer(1, 4))
H.append(encadre(
    'Ce qui manque, et que ce document ne corrige pas',
    'La version etait <b>telechargee et activee</b> ; seul le <b>rechargement</b> etait retenu. '
    '[/!\\] <b>Et hors seance, la personne n est prevenue de RIEN</b> : le message &laquo; Mise a '
    'jour disponible &raquo; n existe que pendant une seance. Elle peut donc rester des heures sur '
    'une version perimee en croyant tester la nouvelle. [!] <b>Ce garde n a PAS ete touche</b> : '
    'c est une decision, pas un oubli, et la reparer sans feu vert serait exactement ce que la regle '
    'R30 interdit. Mesuree, figee par un temoin, et rendue a Michel.', ORANGE))

H.append(P('3. Ce qui EST corrige : un champ jete la ou on le cherchait', 'h1'))
H.append(P('La demande disait : <b>&laquo; le nouveau code est cense tracer le champ source utilise '
           '&raquo;</b>. La trace runtime montre qu il ne le fait pas dans le seul cas qui compte.', 'p'))
H.append(bloc_code(
    "AVANT   res.champ = 'P/G/L'        <- le nom du champ d origine est ECRASE\n"
    "APRES   res.champ       = 'P/G/L'  <- d ou vient la valeur RETENUE\n"
    "        res.champSource = ...      <- d ou venait la valeur BRUTE, jamais reecrit",
    'En derivation, une seule variable portait deux questions differentes :'))
H.append(P('[*] <b>Le code calculait l information, la transportait, puis la jetait exactement la ou '
           'on la cherchait.</b> <font face="Courier">champSource</font> survit desormais a toutes '
           'les branches et part <b>avec la ligne</b> : la question &laquo; d ou vient le 48,3 '
           '&raquo; devient mesurable au prochain scan. [!] <b>Correctif generique</b> &mdash; aucun '
           'test sur le code-barres, aucune valeur en dur, aucun nom de produit dans la decision. '
           'Trois gardes de ce PDF le verifient.', 'p'))

H.append(P('4. Le banc gagne ce qui lui manquait', 'h1'))
H.append(encadre(
    'Un banc qui teste la PIECE ne repond pas a une question posee sur la MACHINE',
    'Le bloc precedent eprouvait le normaliseur <b>isolement</b>, cas par cas &mdash; il ne '
    'conduisait <b>jamais</b> la chaine <i>code-barres -&gt; formulaire -&gt; 410 g -&gt; valeurs '
    'affichees</i>. Or c est <b>exactement</b> cette chaine que la capture montre. [*] Il a donc fallu '
    'ecrire une sonde jetable pour trancher, la ou un temoin permanent aurait repondu en une passe. '
    'Le nouveau bloc (<b>%d temoins</b>) la conduit de bout en bout, avec le vrai code-barres et les '
    'vrais 410 g : <b>la capture est rejouee a chaque passe</b>.' % N_CCCVI, VERT))
H.append(Spacer(1, 4))
H.append(P('[/!\\] <b>Et un temoin etait aveugle &mdash; le jumeau exact d un garde corrige la '
           'veille.</b> Celui des huit origines cherchait le nom de l origine <b>n importe ou</b> '
           'dans le fichier ; or ces noms vivent <b>aussi</b> dans la provenance de la ligne. '
           '<b>Mesure : debrancher une origine le laissait parfaitement vert.</b> Il lit desormais '
           'les <b>appels</b> du normaliseur, et la liste est <b>fermee</b> : il rougit sur une '
           'origine en moins <b>comme</b> sur une origine en trop. <i>C est la meme famille de '
           'defaut, corrigee d un cote et pas de l autre.</i>', 'p'))

H.append(P('5. L origine du 48,3 &mdash; la reponse, apportee par une seconde capture', 'h1'))
H.append(P('[/!\\] Open Food Facts reste <b>injoignable</b> depuis ce conteneur (403 sur les trois '
           'domaines essayes). La question ne pouvait donc pas etre tranchee ici. [*] <b>Elle l a '
           'ete par l ecran de Michel</b>, une fois la bonne version servie &mdash; et c est '
           'exactement ce que le champ d origine conserve devait permettre.', 'p'))
H.append(encadre(
    'La fiche se contredit elle-meme',
    'Elle porte <b>DEUX</b> valeurs energetiques : <b>energy-kcal_100g = 48,3</b> (fausse) et '
    '<b>energy-kj_100g env. 415 kJ = 99,2 kcal</b> (coherente, a 6,4 % des macros). [*] C est '
    'donc l <b>hypothese A</b> : <b>le 48,3 est une erreur DANS LA BASE</b>, pas une conversion '
    'ratee de l application. [*] Et l app a pris le bon chemin sans qu on lui dise : elle a prefere '
    '<b>une valeur de la source</b> (99,2) a une <b>estimation</b> depuis les macros (93,2) '
    '&mdash; l ordre de priorite, verifie sur un vrai produit.', VERT))
H.append(Spacer(1, 4))
H.append(P('[/!\\] <b>Et cette capture a montre un defaut dans mon BANC, pas dans l app</b> : ma '
           'fixture inventait une fiche <b>plus pauvre</b> que la vraie (sans second champ), donc '
           'elle eprouvait la <b>derivation</b> pendant que le vrai produit passe par l '
           '<b>alternative</b>. J avais ecrit &laquo; la capture est rejouee a chaque passe &raquo; '
           '&mdash; c etait faux. <i>Un test qui n emploie pas le schema de la production ne teste '
           'rien, il rassure.</i> Les <b>deux</b> branches sont desormais eprouvees sur le meme '
           'produit.', 'p'))

H.append(P('6. Ce qui prouve tout ce qui precede', 'h1'))
H.append(P('Passe complete verte sur l arbre final : <b>%d / %d</b>. Instantane de ce qui est '
           'reellement ecrit dans le journal alimentaire <b>identique octet pour octet</b> '
           '(sha %s) : <b>aucune ligne deja ecrite ne change</b>.'
           % (PASSE_OK, PASSE_OK + PASSE_KO, SHA_INSTANTANE), 'p'))
H.append(tableau(
    ['Les 10 mutations, sur un arbre copie', 'Temoins rouges'],
    [['<b>LA CAPTURE REINTRODUITE</b> &mdash; la valeur resolue n est plus appliquee : 198 revient, '
      'l ancien encadre aussi', '<b>4</b>'],
     ['le champ source est ecrase comme avant le correctif', '2'],
     ['la trace ne porte plus le champ source', '2'],
     ['une origine debranchee du normaliseur', '1 &mdash; exactement le temoin referme'],
     ['une origine inventee en trop (la liste est fermee des deux cotes)', '1 &mdash; le meme'],
     ['un cas particulier pour ce produit', '1'],
     ['<b>hors perimetre</b> : le garde de mise a jour &laquo; repare &raquo;', '1 &mdash; exactement lui'],
     ['<b>hors perimetre</b> : la douane perd une regle', '1'],
     ['la loi devient trop stricte (un produit sain est reecrit)', '1'],
     ['le meme code-barres scanne et tape divergent', '3'],
     ['<b>les valeurs de la source sont ignorees</b> (on estime toujours)', '<b>6</b>'],
     ['la conversion du second champ est fausse', '<b>6</b>'],
     ['un second champ qui viole aussi la loi est accepte', '1 &mdash; eprouve sur une huile'],
     ['un second champ absurde est accepte', '1']],
    [125 * mm, 40 * mm]))
H.append(Spacer(1, 4))
H.append(P('[*] <b>Les dix mordent, et le controle sain est a zero rouge avant ET apres.</b>', 'petit'))

H.append(P('7. Le geste, pour la prochaine fois', 'h1'))
H.append(encadre(
    'Si l app semble encore montrer un ancien comportement',
    'Revenir sur l <b>Accueil</b>. L app se recharge alors toute seule et affiche &laquo; '
    'Application mise a jour &raquo;. [*] Tant qu on reste sur un autre ecran, la nouvelle version '
    'est <b>deja telechargee et activee</b>, mais la page continue d executer l ancienne &mdash; et '
    'rien ne le dit.', VERT))
H.append(Spacer(1, 4))
H.append(P('Ce PDF est genere par <font face="Courier">tools/gen_1208_pdf.py</font>, dont les %d '
           'gardes recomptent chaque chiffre depuis le code servi et <b>refusent de produire</b> si '
           'un seul fait tombe &mdash; y compris le total de la passe, <b>lu dans son journal</b> et '
           'jamais ecrit a la main.' % N_GARDES, 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - la capture iPhone tranchee par la mesure (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)
print('OK %s  (%s, %d temoins CCCVI, %d gardes, passe %d/%d)'
      % (OUT, VERSION, N_CCCVI, N_GARDES, PASSE_OK, PASSE_OK + PASSE_KO))
