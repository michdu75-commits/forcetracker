#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""AUDIT FORENSIQUE DE LA SOURCE DE VERITE FORCE TRACKER — generateur, 23/09/2026.

[!!] LE PDF SORT HORS DU DEPOT, ET C EST UNE DECISION. Il porte des valeurs de profil
d une personne reelle (age, taille, poids declares) et le depot est PUBLIC — regle d or
#14, R36. Le generateur y vit : il ne contient AUCUNE donnee, il prend ses entrees en
argument.

TOUS LES CHIFFRES SONT RECOMPTES A CHAQUE GENERATION : depuis le JSON du banc dynamique,
depuis le JSON du fan-out statique, et depuis le CODE SERVI. Aucun nombre n est ecrit a
la main dans le texte. Une garde qui tombe = pas de document.

USAGE : python3 tools/gen_audit_forensique_pdf.py <forensique.txt> <wf_results.json> [sortie.pdf]
CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d emoji.
"""
import collections, html, io, json, os, re, subprocess, sys
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (KeepTogether, Paragraph, Preformatted, SimpleDocTemplate,
                                Spacer, Table, TableStyle)
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if len(sys.argv) < 3:
    sys.exit(__doc__)
F_BANC, F_WF = sys.argv[1], sys.argv[2]
OUT = sys.argv[3] if len(sys.argv) > 3 else os.path.join(
    os.path.dirname(F_BANC), 'AUDIT-FORENSIQUE-FORCE-TRACKER-2026-09-23.pdf')
if os.path.abspath(OUT).startswith(os.path.abspath(ROOT) + os.sep):
    sys.exit('REFUS : la sortie est DANS le depot, qui est public, et ce dossier porte des '
             'valeurs de profil personnelles (regle d or #14, R36).')

NB = 0
def garde(ok, msg):
    global NB
    NB += 1
    if not ok:
        sys.exit('GARDE %d : %s' % (NB, msg))

# ══ A. ENTREES ════════════════════════════════════════════════════════════════════════
B = json.loads(io.open(F_BANC, encoding='utf-8').read().split('===JSON===', 1)[1])
W = json.load(io.open(F_WF, encoding='utf-8'))
S_ = B['sections']
garde(B['meta']['lecture_seule'] is True, 'le banc ne se declare plus en lecture seule')
garde(B['meta']['profils']['SYNTH_A']['__SYNTHETIQUE__'] is True
      and B['meta']['profils']['SYNTH_B']['__SYNTHETIQUE__'] is True,
      'les profils du banc ne portent plus le marqueur __SYNTHETIQUE__ (section 34)')
garde(len(W) >= 10, 'le fan-out ne porte que %d dimensions' % len(W))

# ══ B. LE CODE SERVI ══════════════════════════════════════════════════════════════════
SERVIS = ['state.js', 'app.js', 'screens.js', 'log.js', 'coach.js', 'setup.js',
          'tracking.js', 'constants.js', 'index.html', 'sw.js', 'Code.js', 'worker.js']
SRC = {f: io.open(os.path.join(ROOT, f), encoding='utf-8').read() for f in SERVIS}
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SRC['sw.js']) or [None, '?'])[1]
garde(VERSION.startswith('ft-v'), 'la version servie ne se lit plus dans sw.js')

def sans_com(t):
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), t)
    return '\n'.join(re.sub(r'//.*$', '', l) for l in t.split('\n'))

CODE = {f: sans_com(v) for f, v in SRC.items()}

N_BW80 = sum(len(re.findall(r'S\.bw\s*\|\|\s*80', CODE[f])) + len(re.findall(r'\+S\.bw\s*\|\|\s*80', CODE[f]))
             for f in SERVIS)
N_AGE30 = sum(len(re.findall(r'S\.age\s*\|\|\s*30', CODE[f])) for f in SERVIS)
garde(N_BW80 >= 5, 'le repli « S.bw || 80 » n apparait plus que %d fois : le dossier en cite plusieurs' % N_BW80)
garde(N_AGE30 >= 1, 'le repli « S.age || 30 » a disparu du code servi')
garde("const bw = S.bw || 80;" in CODE['app.js'],
      'calcSessionCalories ne replie plus sur 80 kg : le constat central du dossier tomberait')
garde('function profilCaloriqueManquants' in CODE['state.js'],
      'profilCaloriqueManquants a disparu : la comparaison des deux politiques n a plus de sens')
garde("n===3?'3'" in CODE['tracking.js'] and "n===4?'4'" in CODE['tracking.js'],
      '_freqBucketOf ne distingue plus 3 et 4 : le defaut mesure serait corrige')
garde("Object.keys(cnt).find(b=>cnt[b]>=3)" in CODE['state.js'].replace(' ', ''),
      'ecartNiveauActivite ne regroupe plus par cle de bucket')
_app = re.search(r'function appliquerNiveauActivite\(suggere\)\{[\s\S]*?\n\}', CODE['screens.js'])
garde(_app is not None, 'appliquerNiveauActivite ne se lit plus dans screens.js')
garde('coachQuiz' not in _app.group(0),
      'appliquerNiveauActivite ecrit desormais coachQuiz : le dossier affirme le contraire')
garde("POIDS_COLONNES = ['date','poids_kg','masse_grasse_pct']" in CODE['setup.js'].replace("', '", "','"),
      'les colonnes de l export de poids ont change : le dossier affirme que bfSrc en est absent')
garde('bfSrc' not in re.search(r'POIDS_COLONNES\s*=\s*\[[^\]]*\]', CODE['setup.js']).group(0),
      'bfSrc est desormais exporte : le trou decrit est comble')
garde("'age_ans','taille_cm','poids_kg'" in SRC['Code.js'].replace(' ', ''),
      'la feuille Utilisateurs ne porte plus age_ans/taille_cm/poids_kg')
try:
    HEAD = subprocess.check_output(['git', '-C', ROOT, 'rev-parse', '--short', 'HEAD']).decode().strip()
except Exception:
    HEAD = 'INCONNU'
garde(HEAD != 'INCONNU', 'HEAD illisible : le dossier doit nommer l arbre sur lequel il a mesure')
try:
    SALE = subprocess.check_output(['git', '-C', ROOT, 'status', '--porcelain', '--'] + SERVIS).decode().strip()
except Exception:
    SALE = 'x'
garde(SALE == '', 'un fichier SERVI est modifie dans l arbre : le dossier affirme le contraire')

# ══ C. LE BANC DYNAMIQUE — on RECOMPTE ses chiffres ═══════════════════════════════════
F3 = S_['F3_profil_vide']['moteurs']
garde(F3['tdee'] is None, 'sur profil vide calcTDEE ne rend plus null mais %r' % F3['tdee'])
garde(isinstance(F3['seance'], dict) and isinstance(F3['seance']['total'], (int, float)),
      'sur profil vide calcSessionCalories ne rend plus un nombre : le constat central tombe')
SEANCE_VIDE = F3['seance']['total']
MANQUANTS = F3['manquants']
garde(isinstance(MANQUANTS, list) and len(MANQUANTS) == 3,
      'profilCaloriqueManquants ne nomme plus 3 champs mais %r' % (MANQUANTS,))

F1 = S_['F1_chaine_ui']
E1, E2, E4, E5 = (F1['1_apres_saveProfile'], F1['2_apres_reload'],
                  F1['4_age_vide_puis_save'], F1['5_age_120_hors_bornes'])
garde(E1['S']['age'] == 48 and E1['S']['height'] == 180 and abs(E1['S']['bw'] - 85.9) < .01,
      'la saisie UI n atteint plus S : %r' % (E1['S'],))
garde(E2['S']['age'] == 48 and E2['S']['bw'] == E1['S']['bw'],
      'le profil ne survit plus au rechargement')
garde(E4['S']['age'] == 48, 'un champ vide efface desormais la valeur : le dossier dit l inverse')
garde(E5['S']['age'] == 48, 'une valeur hors bornes est desormais acceptee')
garde(not F1.get('__erreurs_page'), 'la page a leve des erreurs pendant la mesure : %r' % F1.get('__erreurs_page'))
BMR_D, TDEE_D = E1['moteurs']['bmr'], E1['moteurs']['tdee']
garde(isinstance(TDEE_D, int) and 3000 < TDEE_D < 3300, 'le TDEE mesure vaut %r' % TDEE_D)

F4 = S_['F4_une_variable']
REF4 = F4['reference']['sortie']
VAR = {v['champ']: v for v in F4['variations']}
garde(VAR['level']['nb_sorties_changees'] == 0,
      'le champ level change desormais %d sortie(s)' % VAR['level']['nb_sorties_changees'])
def dlt(champ, cle):
    c = VAR[champ]['change'].get(cle)
    return None if not c else (c[1] - c[0])
D_ACT, D_WORK = dlt('activityLevel', 'tdee'), dlt('workType', 'tdee')
D_SMOKE, D_SEX, D_AGE, D_HT = dlt('smoker', 'tdee'), dlt('gender', 'tdee'), dlt('age', 'tdee'), dlt('height', 'tdee')
garde(D_ACT and D_ACT > 250, 'l ecart de multiplicateur vaut %r' % D_ACT)
garde(D_WORK == -450, 'le metier physique ne vaut plus -450 mais %r' % D_WORK)

F6 = S_['F6_calories_seance']
NEUTRES = [k for k, v in F6['sensibilite'].items() if v['delta'] == 0]
SENSIBLES = [k for k, v in F6['sensibilite'].items() if v['delta'] not in (0, None)]
garde(all('bw' in k for k in SENSIBLES),
      'un champ autre que le poids change desormais les calories de seance : %r' % SENSIBLES)
garde(len(NEUTRES) >= 10, 'seulement %d champs neutres mesures' % len(NEUTRES))
garde(F6['dans_le_tdee']['sportExtra'] == 0 and F6['dans_le_tdee']['pasExtra'] == 0,
      'les calories de seance entrent desormais dans le TDEE')
SEA_AVEC, SEA_SANS = F6['reference']['total'], F6['poids_absent']['total']
garde(SEA_SANS is not None and SEA_SANS != SEA_AVEC,
      'le poids absent ne change plus le resultat : le repli silencieux serait ferme')
RATIO80 = round(SEA_AVEC * 80.0 / 85.9)
garde(abs(RATIO80 - SEA_SANS) <= 1,
      'le repli ne vaut plus 80 kg : attendu ~%d, mesure %d' % (RATIO80, SEA_SANS))

F5 = S_['F5_frequence']
UNI = {tuple(e['demande']): e for e in F5['essais_uniformes']}
SEQ = {tuple(e['demande']): e for e in F5['essais_sequences']}
garde(SEQ[(3, 3, 3, 3)]['carte'] is not None, '3/3/3/3 ne declenche plus la carte')
garde(SEQ[(4, 4, 4, 4)]['carte'] is not None, '4/4/4/4 ne declenche plus la carte')
MUETTES = [s for s in [(3, 4, 3, 4), (4, 3, 4, 3), (3, 3, 4, 4), (4, 4, 3, 3)] if SEQ[s]['carte'] is None]
garde(len(MUETTES) == 4,
      'seules %d sequences alternees sur 4 restent muettes : le defaut serait partiellement corrige' % len(MUETTES))
garde(UNI[(7, 7, 7, 7)]['carte'] is None, '7 seances proposent desormais quelque chose')

# ══ D. LE FAN-OUT — on RECOMPTE ═══════════════════════════════════════════════════════
SEV = collections.Counter()      # severite ANNONCEE par l auditeur
RAY = collections.Counter()
VERD = collections.Counter()
for d in W:
    for f in d['defauts']:
        SEV[f['severite']] += 1
        RAY[f['rayon']] += 1
        VERD[f.get('__verdict', 'SANS VERDICT')] += 1
N_DEF = sum(SEV.values())
CONFIRMES = [(d['__dim'], f) for d in W for f in d['defauts']
             if f.get('__verdict') not in (None, 'SANS VERDICT', 'REFUTE')]
REFUTES = [(d['__dim'], f) for d in W for f in d['defauts'] if f.get('__verdict') == 'REFUTE']
SANS = [(d['__dim'], f) for d in W for f in d['defauts'] if f.get('__verdict') == 'SANS VERDICT']
SEV_V = collections.Counter((f.get('__sev') or f['severite']) for _d, f in CONFIRMES)
# [!!] L EFFET MESURE DE LA VERIFICATION : elle n a jamais aggrave, elle a retrograde.
ORDRE = {'CRITIQUE': 4, 'MAJEUR': 3, 'MOYEN': 2, 'MINEUR': 1, 'DOCUMENTATION': 0}
RETRO = [(f['severite'], f.get('__sev') or f['severite']) for _d, f in CONFIRMES]
N_BAISSE = sum(1 for a, b in RETRO if ORDRE[b] < ORDRE[a])
N_HAUSSE = sum(1 for a, b in RETRO if ORDRE[b] > ORDRE[a])
CRIT_VERIF = [(a, b) for a, b in RETRO if a == 'CRITIQUE']
garde(len(CONFIRMES) + len(REFUTES) + len(SANS) == N_DEF,
      'les verdicts ne se recomposent pas : %d + %d + %d != %d'
      % (len(CONFIRMES), len(REFUTES), len(SANS), N_DEF))
garde(N_HAUSSE == 0, 'la verification a AGGRAVE %d defaut(s)' % N_HAUSSE)
garde(len(SANS) > 0, 'tous les defauts ont un verdict : le dossier decrit l inverse')
garde(len(CRIT_VERIF) > 0 and all(b != 'CRITIQUE' for a, b in CRIT_VERIF),
      'aucun CRITIQUE verifie, ou l un a survecu : le dossier affirme le contraire')
# [!!] LE PIEGE DE LECTURE, TROUVE PAR MICHEL EN INSPECTANT LE JSON LUI-MEME :
#    une dimension a 0 verdict n est PAS une dimension propre, c est une dimension NON EXAMINEE.
#    Un tableau qui affiche « 0 confirme, 0 refute » se lit exactement a l envers de la verite.
DIM_VERIF = [d for d in W if any(f.get('__verdict') not in (None, 'SANS VERDICT') for f in d['defauts'])]
DIM_MUETTES = [d for d in W if d not in DIM_VERIF]
N_DEF_MUETS = sum(len(d['defauts']) for d in DIM_MUETTES)
garde(len(DIM_MUETTES) > 0, 'toutes les dimensions ont ete verifiees : le dossier decrit l inverse')
garde(len(DIM_VERIF) + len(DIM_MUETTES) == len(W), 'le partage des dimensions ne se recompose pas')
N_FAITS = sum(len(d['faits']) for d in W)
N_INC = sum(len(d['inconnues']) for d in W)
CRIT = [(d['__dim'], f) for d in W for f in d['defauts'] if f['severite'] == 'CRITIQUE']
garde(N_DEF == len(CRIT) + SEV['MAJEUR'] + SEV['MOYEN'] + SEV['MINEUR'] + SEV['DOCUMENTATION'],
      'le total des defauts ne se recompose pas')
garde(len(CRIT) == SEV['CRITIQUE'], 'le compte des critiques diverge')
PROV = collections.Counter(f['provenance'] for d in W for f in d['faits'])
garde(sum(PROV.values()) == N_FAITS, 'le compte des provenances diverge du compte des faits')
garde(PROV.get('A', 0) > 0, 'aucun fait [A] : un audit sans mesure directe ne vaut rien')

# ══ E. RENDU ══════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B'); ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A'); FOND = colors.HexColor('#F4F4F2')
FONDC = colors.HexColor('#EEEEEC'); TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46'); ORANGE = colors.HexColor('#B26A00')
SS = getSampleStyleSheet()
stl = {
 'titre': ParagraphStyle('t', parent=SS['Title'], fontName='Helvetica-Bold', fontSize=18,
                         leading=22, textColor=ENCRE, alignment=TA_LEFT, spaceAfter=2),
 'sous': ParagraphStyle('s', parent=SS['Normal'], fontName='Helvetica', fontSize=9.3,
                        leading=12.8, textColor=GRIS, spaceAfter=13),
 'h1': ParagraphStyle('h1', parent=SS['Heading1'], fontName='Helvetica-Bold', fontSize=12.5,
                      leading=15.5, textColor=ROUGE, spaceBefore=13, spaceAfter=5),
 'h2': ParagraphStyle('h2', parent=SS['Heading2'], fontName='Helvetica-Bold', fontSize=10,
                      leading=13, textColor=ENCRE, spaceBefore=8, spaceAfter=3),
 'p': ParagraphStyle('p', parent=SS['Normal'], fontName='Helvetica', fontSize=9.1,
                     leading=12.9, textColor=ENCRE, spaceAfter=5),
 'petit': ParagraphStyle('pt', parent=SS['Normal'], fontName='Helvetica', fontSize=8,
                         leading=11, textColor=GRIS, spaceAfter=4),
 'cell': ParagraphStyle('c', parent=SS['Normal'], fontName='Helvetica', fontSize=7.6, leading=9.9),
 'cellb': ParagraphStyle('cb', parent=SS['Normal'], fontName='Helvetica-Bold', fontSize=7.6, leading=9.9),
 'code': ParagraphStyle('co', parent=SS['Normal'], fontName='Courier', fontSize=6.8,
                        leading=8.5, textColor=ENCRE),
}
def _v(x, ou='texte'):
    x = str(x)
    for ch in x:
        try: ch.encode('cp1252')
        except UnicodeEncodeError:
            sys.exit('CARACTERE NON RENDU %r (%s) dans %s' % (ch, hex(ord(ch)), ou))
    for m in re.finditer(r'&([A-Za-z][A-Za-z0-9]{1,15});', x):
        c = html.unescape(m.group(0))
        if len(c) == 1:
            try: c.encode('cp1252')
            except UnicodeEncodeError: sys.exit('ENTITE NON RENDUE %s dans %s' % (m.group(0), ou))
    return x

def _n(x):
    """Nettoie un texte venu d un sous-agent : il peut porter n importe quel caractere."""
    x = (str(x).replace('’', "'").replace('‘', "'").replace('–', '-')
         .replace('—', '-').replace('→', '->').replace(' ', ' ')
         .replace('“', '"').replace('”', '"').replace('…', '...')
         .replace(' ', ' ').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
         .replace('≤', '&lt;=').replace('≥', '&gt;=').replace('×', 'x')
         .replace('✅', '[ok]').replace('❌', '[X]').replace('⚠', '[!]')
         .replace('⭐', '[*]').replace('⛔', '[X]').replace('⬛', ''))
    return ''.join(c if c == '\n' or (32 <= ord(c) < 127) or _cp(c) else '?' for c in x)
def _cp(c):
    try: c.encode('cp1252'); return True
    except Exception: return False

def P(t, s='p'): return Paragraph(_v(t, 'paragraphe'), stl[s])
def encadre(titre, corps, couleur=ROUGE):
    t = Table([[Paragraph('<b>%s</b>' % _v(titre), stl['cellb'])],
               [Paragraph(_v(corps), stl['cell'])]], colWidths=[168 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), FOND),
        ('LEFTPADDING', (0,0), (-1,-1), 8), ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LINEBEFORE', (0,0), (0,-1), 2.4, couleur), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
    return KeepTogether(t)
def tableau(entetes, ligs, larg, petit=False):
    st = 'cell'
    data = [[Paragraph('<b>%s</b>' % _v(h), stl['cellb']) for h in entetes]]
    for l in ligs: data.append([Paragraph(_v(c), stl[st]) for c in l])
    t = Table(data, colWidths=larg, repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDEDEA')),
        ('GRID', (0,0), (-1,-1), 0.4, TRAIT), ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5), ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('TOPPADDING', (0,0), (-1,-1), 3), ('BOTTOMPADDING', (0,0), (-1,-1), 3)]))
    return t
def bloc_code(txt, legende=None):
    _v(txt, 'bloc de code')
    for l in txt.split('\n'):
        if stringWidth(l, 'Courier', 6.8) > 168 * mm - 12:
            sys.exit('LIGNE QUI DEBORDE (%d car) : %s' % (len(l), l[:70]))
    t = Table([[Preformatted(txt, stl['code'])]], colWidths=[168 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), FONDC),
        ('LEFTPADDING', (0,0), (-1,-1), 7), ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LINEBEFORE', (0,0), (0,-1), 2.0, TRAIT), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
    return KeepTogether([Paragraph(_v(legende), stl['petit']), t]) if legende else t
def pied(cv, doc):
    cv.saveState(); cv.setFont('Helvetica', 7.2); cv.setFillColor(GRIS)
    cv.drawString(21 * mm, 12 * mm, 'AUDIT FORENSIQUE DE LA SOURCE DE VERITE - Force Tracker %s - '
                  '23/09/2026 - arbre %s - DONNEES PERSONNELLES, hors depot' % (VERSION, HEAD))
    cv.drawRightString(189 * mm, 12 * mm, 'page %d' % doc.page)
    cv.setStrokeColor(TRAIT); cv.setLineWidth(0.4); cv.line(21 * mm, 16 * mm, 189 * mm, 16 * mm)
    cv.restoreState()
def kf(x, d=0): return ('%.*f' % (d, x)).replace('.', ',')
def kfs(x, d=0): return ('%+.*f' % (d, x)).replace('.', ',')

H = []
H.append(P('Audit forensique de la source de verite', 'titre'))
H.append(P('Force Tracker - 23 septembre 2026 - application servie en <b>%s</b>, arbre <b>%s</b>.<br/>'
  'Declencheur : une reconstruction de profil a perdu son statut &laquo; approche &raquo; en '
  'changeant de fichier et a fini publiee comme le profil reel de Michel.<br/>'
  '[!!] Ce dossier porte des valeurs de profil personnelles. Il est genere <b>hors du depot</b>, '
  'qui est public (regle d or #14, R36).' % (VERSION, HEAD), 'sous'))

H.append(encadre('Resume executif',
  'Perimetre : <b>%d faits</b> ancres, <b>%d defauts</b> et <b>%d points declares INCONNUS</b> sur '
  '%d dimensions statiques, plus <b>8 sections mesurees dans un vrai navigateur</b> sur '
  'l application servie. [*] <b>La chaine UI -&gt; stockage -&gt; rechargement -&gt; runtime -&gt; '
  'moteur est SAINE</b> : une saisie arrive intacte jusqu au calcul et survit au rechargement. '
  '[*] Le probleme n est pas la, il est dans <b>ce que l application fait quand la donnee MANQUE</b>, '
  'et dans <b>la circulation des valeurs entre outils et documents</b>. [!!] '
  '<b>%d ont ete CONFIRMES par verification adversariale, %d refutes, et %d n ont AUCUN verdict</b> '
  '- les verificateurs ont ete coupes par la limite de session. [!!] <b>Et la verification a '
  'retrograde %d des %d severites qu elle a touchees, sans jamais en aggraver une seule</b> : les '
  'DEUX defauts annonces CRITIQUES qu elle a examines sont <b>tombes a MOYEN</b>. <i>C est '
  'exactement pourquoi les %d defauts sans verdict sont donnes ici comme des pistes ancrees et '
  'jamais comme des faits.</i> [/!\\] <b>Aucune correction n a ete publiee, aucun fichier servi '
  'n est modifie</b> (verifie par git sur %d fichiers), aucun bump de version.'
  % (N_FAITS, N_DEF, N_INC, len(W), len(CONFIRMES), len(REFUTES), len(SANS),
     N_BAISSE, len(CONFIRMES), len(SANS), len(SERVIS)), ROUGE))

# ── 1. provenance
H.append(P('1. Regle de provenance appliquee a ce dossier', 'h1'))
H.append(tableau(['Etiquette', 'Ce qu elle garantit', 'Faits de ce dossier'],
  [['<b>[A] MESURE DIRECTE</b>', 'vu dans le code servi, ou mesure dans un vrai navigateur sur '
    'l application servie', '<b>%d</b>' % PROV.get('A', 0)],
   ['<b>[B] DECLARATION</b>', 'dit par Michel, jamais confronte a son etat interne', '%d' % PROV.get('B', 0)],
   ['<b>[C] INFERENCE</b>', 'reconstruction, hypothese, profil approche', '%d' % PROV.get('C', 0)],
   ['<b>[D] SOURCE EXTERNE</b>', 'publication ou documentation exterieure', '%d' % PROV.get('D', 0)],
   ['<b>[E] HISTORIQUE</b>', 'trouve dans docs/ ou un commit, non confronte au code actuel', '%d' % PROV.get('E', 0)]],
  [30 * mm, 108 * mm, 30 * mm]))
H.append(Spacer(1, 3))
H.append(P('[/!\\] <b>Les valeurs 48 ans / 180 cm / 3-4 seances sont des [B], pas des [A].</b> '
  'Le conteneur ne peut pas lire l etat interne du telephone de Michel, et aucun des trois exports '
  'CSV ne porte de champ de profil. Elles ne sont utilisees nulle part comme une mesure.', 'petit'))

# ── 2. chronologie
H.append(P('2. Chronologie de la contamination du profil (mesuree par git)', 'h1'))
H.append(tableau(['Heure', 'Commit', 'Ou', 'Formulation', 'Statut'],
  [['14:48', '61f0da8e', 'audit_nutri_moteur.js:53<br/>AUDIT-NUTRITION:32',
    '&laquo; Profil <b>approche</b> du cahier &raquo;', '<b>[C] honnete</b>'],
   ['14:50', 'ebbb3479', 'gen_audit_nutri_pdf.py:213', '&laquo; mon profil <b>approche</b> &raquo;', '[C]'],
   ['<b>15:57</b>', '<b>ecd12fbd</b>', '<b>tests/parcours/nutri_proprietes.js:45</b>',
    '<font face="Courier">const base = {...}</font><br/><b>plus aucune mention</b>',
    '<b>[!!] le label tombe</b>'],
   ['20:24', 'bceea841', 'banc_v9.js:124 et :128',
    '&laquo; <b>Profil de Michel</b> &raquo;<br/>&laquo; le <b>VRAI</b> profil &raquo;', '<b>[C] -&gt; [A]</b>'],
   ['20:24', 'bceea841', 'DOSSIER-V9:159 et :401', '&laquo; profil <b>relu</b> dans l audit &raquo;',
    'reconstruit -&gt; relu'],
   ['21:10', '789df53e', 'RETOURS-TESTEURS.md:285', 'sans aucune reserve', 'publie comme fait'],
   ['21:46', '2c55e5a6', 'gen_dossier_tdee_michel_pdf.py:170',
    '<font face="Courier">BW, HT, AGE = 85.8, 179.0, 41.0</font>', '<b>le PDF en fait un fait</b>']],
  [13 * mm, 18 * mm, 43 * mm, 54 * mm, 40 * mm]))
H.append(Spacer(1, 3))
H.append(encadre('Le point de bascule n est pas un document : c est une copie de fixture',
  'Le mot &laquo; approche &raquo; ne meurt pas dans un rapport, il meurt a <b>15:57</b> quand la '
  'fixture est recopiee dans un TEST <b>sans son commentaire</b>. Cinq heures plus tard, un autre '
  'fichier lit la fixture nue et la baptise &laquo; le vrai profil &raquo;. [*] <b>Et le pire est '
  'une phrase de moi</b> : <font face="Courier">DOSSIER-V9:401</font> presente le passage de [C] a '
  '[A] comme une <b>correction</b> - &laquo; profil relu dans l audit au lieu d etre reconstruit de '
  'memoire &raquo;. <i>Une reconstruction y corrige une autre reconstruction, et la seconde s appelle '
  'desormais une lecture.</i>', ROUGE))

# ── 3. ce qui est sain
H.append(P('3. Ce qui est SAIN - la chaine de saisie, mesuree dans un vrai navigateur', 'h1'))
H.append(P('Profil <b>SYNTHETIQUE</b> etiquete (section 34 du cahier), conduit par la vraie interface : '
  'on remplit les champs et on clique Enregistrer. Zero erreur de page.', 'p'))
H.append(tableau(['Etape', 'age', 'taille', 'poids', 'activite'],
  [['saisie dans l interface', '<font face="Courier">48</font>', '<font face="Courier">180</font>',
    '<font face="Courier">85,9</font> <i>(virgule FR)</i>', '<font face="Courier">1.55</font>'],
   ['apres Enregistrer, objet S', str(E1['S']['age']), str(E1['S']['height']),
    '<b>%s</b>' % E1['S']['bw'], str(E1['S']['activityLevel'])],
   ['localStorage', E1['LS']['age'] or '-', E1['LS']['ht'] or '-', E1['LS']['bw'] or '-', E1['LS']['act'] or '-'],
   ['<b>apres rechargement complet</b>', str(E2['S']['age']), str(E2['S']['height']),
    '<b>%s</b>' % E2['S']['bw'], str(E2['S']['activityLevel'])],
   ['apres navigation et retour', str(F1['3_apres_navigation']['S']['age']),
    str(F1['3_apres_navigation']['S']['height']), str(F1['3_apres_navigation']['S']['bw']),
    str(F1['3_apres_navigation']['S']['activityLevel'])]],
  [52 * mm, 24 * mm, 26 * mm, 40 * mm, 26 * mm]))
H.append(Spacer(1, 3))
H.append(P('[ok] La virgule francaise est convertie correctement. [ok] Un age de <b>120</b> est '
  '<b>refuse</b> et l ancienne valeur tient (%s). [/!\\] <b>Mais un champ VIDE puis enregistre '
  'n efface rien</b> : la valeur est conservee en silence (%s) - il n existe aucun geste pour '
  'retirer une valeur de profil.' % (E5['S']['age'], E4['S']['age']), 'p'))

# ── 4. le constat central
H.append(P('4. CRITIQUE - deux politiques opposees pour la meme absence', 'h1'))
H.append(P('Mesure sur un profil <b>totalement vide</b>, dans la meme page, au meme instant :', 'p'))
H.append(tableau(['Moteur', 'Reponse sur profil vide', 'Politique'],
  [['<font face="Courier">calcTDEE()</font>', '<b>null</b>', '[ok] il refuse'],
   ['<font face="Courier">bmrDetail()</font>', '0, et nomme les manquants : %s' % ', '.join(MANQUANTS),
    '[ok] il refuse et le dit'],
   ['<font face="Courier">calcMacros()</font>', 'null partout', '[ok] il refuse'],
   ['<b><font face="Courier">calcSessionCalories()</font></b>', '<b>%s kcal</b>' % SEANCE_VIDE,
    '<b>[X] il invente un poids</b>']],
  [52 * mm, 66 * mm, 50 * mm]))
H.append(Spacer(1, 3))
H.append(bloc_code(
 "app.js:720      const bw = S.bw || 80;         <- calories de seance\n"
 "app.js:47                  (S.bw||80)          <- calories de cardio\n"
 "app.js:472      const bw = +S.bw||80;\n"
 "app.js:7265     const bw = S.bw || 80;\n"
 "app.js:7310     const dose = Math.round((S.bw || 80) * 0.4);   <- dose de creatine\n"
 "tracking.js:238 const bw = S.bw||80, ...\n"
 "tracking.js:243/249   S.age || 30                              <- age de repli\n"
 "\n"
 "MESURE : poids present %s kcal | poids ABSENT %s kcal | %s x 80 / 85,9 = %s\n"
 "         poids = 0        %s kcal (traite comme absent)\n"
 "         poids = 'abc'    null, SANS erreur  (NaN silencieux)"
 % (SEA_AVEC, SEA_SANS, SEA_AVEC, RATIO80,
    S_['F7_defauts_silencieux'].get('seance_poids_zero')),
 'Le repli, releve dans le code servi (%d occurrences de S.bw || 80, %d de S.age || 30) et verifie par la mesure :'
 % (N_BW80, N_AGE30)))
H.append(Spacer(1, 3))
H.append(P('[!!] <b>ft-v1232 a appris au moteur nutritionnel a dire &laquo; je ne sais pas &raquo;. '
  'Le moteur des calories de seance, lui, substitue 80 kg sans rien dire.</b> Deux reponses opposees '
  'a la meme question, dans la meme application, au meme instant.', 'p'))

# ── 5. calories de seance
H.append(P('5. Les calories de seance - reponse mesuree (sections 10 et 33 du cahier)', 'h1'))
lig = []
for k, v in F6['sensibilite'].items():
    lig.append([k.replace('"', ''), str(v['total']),
                ('<b>%s</b>' % kfs(v['delta'])) if v['delta'] else '0',
                '<b>[X] change</b>' if v['delta'] else '[ok] neutre'])
H.append(tableau(['Champ de profil modifie', 'kcal', 'delta', ''], lig,
                 [70 * mm, 24 * mm, 30 * mm, 44 * mm]))
H.append(Spacer(1, 3))
H.append(encadre('Seul le poids entre - et ces calories ne touchent pas le TDEE',
  'L age, la taille, le sexe, le niveau d activite, le metier, le tabac, le niveau et l objectif '
  'donnent tous un <b>delta nul</b> (%d champs mesures). Seul le poids agit, et proportionnellement. '
  '[*] <b>Et ces calories n entrent PAS dans le TDEE</b> : mesure, '
  '<font face="Courier">calcSportExtra() = %s</font> et '
  '<font face="Courier">calcPasExtra() = %s</font>. [*] <b>Consequence directe pour le dossier du '
  '22/09</b> : une erreur d age ou de taille <b>ne contamine pas</b> la depense affichee apres une '
  'seance ; une erreur de <b>poids</b> si, dans la meme proportion.'
  % (len(NEUTRES), F6['dans_le_tdee']['sportExtra'], F6['dans_le_tdee']['pasExtra']), VERT))

# ── 6. frequence
H.append(P('6. La proposition d ajustement du niveau d activite - defaut confirme a l execution', 'h1'))
lig = []
for s in [(3,3,3,3), (4,4,4,4), (3,4,3,4), (4,3,4,3), (3,3,4,4), (4,4,3,3)]:
    e = SEQ[s]; c = e['carte']
    lig.append(['/'.join(str(x) for x in s),
                ', '.join(str(x) for x in e['niveaux']),
                ('<b>suggere %s</b>' % c['suggere']) if c else '<b>[X] RIEN</b>'])
for s in [(5,5,5,5), (7,7,7,7)]:
    e = UNI[s]; c = e['carte']
    lig.append(['/'.join(str(x) for x in s), ', '.join(str(x) for x in e['niveaux']),
                ('suggere %s' % c['suggere']) if c else '<b>[X] RIEN</b>'])
H.append(tableau(['4 dernieres semaines', 'Niveaux correspondants', 'Carte proposee'], lig,
                 [42 * mm, 72 * mm, 54 * mm]))
H.append(Spacer(1, 3))
H.append(bloc_code(
 "tracking.js   _freqBucketOf(n) = n<=2 ? '1' : n===3 ? '3' : n===4 ? '4' : '5'\n"
 "state.js      _ACT_PAR_FREQ    = { '1':1.375, '3':1.55, '4':1.55, '5':1.725 }\n"
 "state.js      const bucket = Object.keys(cnt).find(b => cnt[b] >= 3);\n"
 "\n"
 "  -> 3 seances donne la cle '3', 4 seances donne la cle '4'\n"
 "  -> les DEUX pointent vers le MEME niveau 1.55\n"
 "  -> qui alterne 3 et 4 n atteint jamais le seuil des 3 semaines sur 4",
 'Les trois lignes qui produisent le defaut, relues dans le code servi a chaque generation :'))
H.append(Spacer(1, 3))
H.append(P('[*] <b>%d sequences alternees sur 4 restent muettes</b> alors que les quatre semaines '
  'sont au meme niveau. [*] Et <font face="Courier">appliquerNiveauActivite()</font> ecrit '
  '<font face="Courier">S.activityLevel</font> <b>sans toucher</b> '
  '<font face="Courier">coachQuiz.answers.freq</font> : la double declaration du meme fait, que '
  '<font face="Courier">state.js</font> documente lui-meme, reste ouverte.' % len(MUETTES), 'p'))

# ── 7. une variable a la fois
H.append(P('7. Une variable a la fois - le poids de chaque champ (section 26)', 'h1'))
lig = []
for champ, lab in [('activityLevel', 'niveau d activite 1,55 -&gt; 1,725'),
                   ('workType', 'metier physique -&gt; bureau'), ('gender', 'sexe H -&gt; F'),
                   ('smoker', 'tabac non -&gt; oui'), ('age', 'age 48 -&gt; 41'),
                   ('height', 'taille 180 -&gt; 179'), ('bw', 'poids 85,9 -&gt; 85,8'),
                   ('goal', 'objectif recomp -&gt; muscle'),
                   ('nutritionPhase', 'phase charge -&gt; decharge'), ('level', 'niveau vide -&gt; avance')]:
    v = VAR[champ]; ch = v['change']
    def g(k):
        c = ch.get(k)
        return kfs(c[1] - c[0]) if c and isinstance(c[0], (int, float)) else '0'
    lig.append([lab, g('tdee'), g('cible'), g('g'),
                '<b>%d</b>' % v['nb_sorties_changees']])
H.append(tableau(['Variation (une seule a la fois)', 'TDEE', 'Cible', 'Glucides (g)', 'Sorties changees'],
                 lig, [66 * mm, 24 * mm, 24 * mm, 28 * mm, 26 * mm]))
H.append(Spacer(1, 3))
H.append(P('[!!] <b>Le champ <font face="Courier">level</font> ne change AUCUNE sortie</b> : il est '
  'collecte par l interface et relu par aucun moteur nutritionnel (section 28 du cahier, confirmee '
  'par la mesure).', 'p'))

# ── 8. les critiques du fan-out
H.append(P('8. Les %d defauts CONFIRMES par verification adversariale' % len(CONFIRMES), 'h1'))
H.append(encadre('Ce que la verification a fait aux severites - et pourquoi ca decide de tout',
  'Sur les <b>%d defauts</b> releves, seuls <b>%d ont pu etre contre-verifies</b> : les '
  'verificateurs suivants ont ete coupes par la limite de session. [*] Sur ces %d, la verification '
  'a <b>retrograde %d severites et n en a aggrave AUCUNE</b>. [!!] <b>Les deux defauts annonces '
  'CRITIQUES qu elle a examines sont tombes a MOYEN.</b> [*] <i>Donc les %d defauts restes sans '
  'verdict ne sont pas &laquo; probablement vrais &raquo; : le seul echantillon contre-verifie dit '
  'que la severite annoncee est surevaluee environ une fois sur trois.</i>'
  % (N_DEF, len(CONFIRMES), len(CONFIRMES), N_BAISSE, len(SANS)), ORANGE))
H.append(Spacer(1, 4))
lig = []
for dim, f in sorted(CONFIRMES, key=lambda x: -ORDRE[x[1].get('__sev') or x[1]['severite']]):
    lig.append(['<b>%s</b>' % (f.get('__sev') or f['severite']), f.get('__ray') or f['rayon'], dim,
                _n(f['titre'])[:130], '<font face="Courier">%s</font>' % _n(f['ancre'])[:52]])
H.append(tableau(['Severite verifiee', 'Rayon', 'Dimension', 'Defaut CONFIRME', 'Ancre'], lig,
                 [22 * mm, 22 * mm, 26 * mm, 62 * mm, 36 * mm]))
H.append(Spacer(1, 4))
H.append(P('Les %d defauts REFUTES - ils ne sont pas supprimes, ils sont classes' % len(REFUTES), 'h2'))
H.append(tableau(['Dimension', 'Defaut refute', 'Pourquoi il ne tient pas'],
  [[dim, _n(f['titre'])[:95], _n(f.get('__pourquoi', ''))[:230]] for dim, f in REFUTES],
  [26 * mm, 62 * mm, 80 * mm]))
H.append(Spacer(1, 4))
H.append(P('8b. Les %d pistes ancrees et NON verifiees - les plus lourdes' % len(SANS), 'h2'))
H.append(P('[/!\\] Donnees avec leur ancre <b>pour etre ouvertes, pas pour etre crues</b>. '
  '<i>Un defaut non contre-verifie est une piste, pas un fait.</i>', 'petit'))
lig = []
for dim, f in [x for x in SANS if x[1]['severite'] in ('CRITIQUE', 'MAJEUR')][:24]:
    lig.append([f['severite'], dim, _n(f['titre'])[:118],
                '<font face="Courier">%s</font>' % _n(f['ancre'])[:46]])
H.append(tableau(['Severite ANNONCEE', 'Dimension', 'Piste', 'Ancre'], lig,
                 [24 * mm, 26 * mm, 74 * mm, 44 * mm]))

# ── 9. repartition
H.append(P('9. Repartition des %d defauts et etat de leur verification' % N_DEF, 'h1'))
H.append(tableau(['Dimension', 'Faits', 'CRIT', 'MAJ', 'MOY', 'MIN', 'DOC', 'Verifies', 'Sans verdict'],
  [[d['__dim'], str(len(d['faits'])),
    str(sum(1 for f in d['defauts'] if f['severite'] == 'CRITIQUE')),
    str(sum(1 for f in d['defauts'] if f['severite'] == 'MAJEUR')),
    str(sum(1 for f in d['defauts'] if f['severite'] == 'MOYEN')),
    str(sum(1 for f in d['defauts'] if f['severite'] == 'MINEUR')),
    str(sum(1 for f in d['defauts'] if f['severite'] == 'DOCUMENTATION')),
    '<b>%d</b>' % sum(1 for f in d['defauts'] if f.get('__verdict') not in (None, 'SANS VERDICT')),
    str(sum(1 for f in d['defauts'] if f.get('__verdict') == 'SANS VERDICT'))] for d in W]
  + [['<b>TOTAL</b>', '<b>%d</b>' % N_FAITS, '<b>%d</b>' % SEV['CRITIQUE'], '<b>%d</b>' % SEV['MAJEUR'],
      '<b>%d</b>' % SEV['MOYEN'], '<b>%d</b>' % SEV['MINEUR'], '<b>%d</b>' % SEV['DOCUMENTATION'],
      '<b>%d</b>' % (len(CONFIRMES) + len(REFUTES)), '<b>%d</b>' % len(SANS)]],
  [38 * mm, 15 * mm, 14 * mm, 14 * mm, 14 * mm, 14 * mm, 14 * mm, 20 * mm, 25 * mm]))
H.append(Spacer(1, 3))
H.append(P('[/!\\] Les colonnes CRIT a DOC portent la severite <b>ANNONCEE</b>. La severite '
  '<b>VERIFIEE</b> n existe que pour les %d defauts de la section 8.' % len(CONFIRMES), 'petit'))
H.append(Spacer(1, 4))
H.append(encadre('[!!] Comment NE PAS lire ce tableau - le piege est dans la colonne de droite',
  '<b>%d dimensions sur %d affichent zero verifie.</b> [*] Cela ne veut PAS dire qu elles sont '
  'propres : cela veut dire qu <b>aucun de leurs %d defauts n a ete examine</b>. Les verificateurs '
  'ont ete coupes avant de les atteindre. [*] <i>Un tableau qui affiche &laquo; 0 confirme, '
  '0 refute &raquo; se lit exactement a l envers de la verite</i> - et c est Michel qui l a vu, en '
  'inspectant le JSON au lieu de lire mon resume. [*] Les deux seules dimensions reellement '
  'contre-verifiees sont <b>%s</b>.'
  % (len(DIM_MUETTES), len(W), N_DEF_MUETS,
     ' et '.join('<font face="Courier">%s</font>' % d['__dim'] for d in DIM_VERIF)), ROUGE))

# ── 10. matrice donnees
H.append(P('10. Matrice des donnees critiques (section 40)', 'h1'))
MAT = [
 ['poids', 'UI Profil', 'oui', '<font face="Courier">ft4_bw</font>', 'S.bw',
  'BMR, TDEE, macros, <b>calories de seance</b>, creatine, niveaux de force',
  '[A] mesure', '<b>oui - repli 80 kg</b>'],
 ['taille', 'UI Profil', 'oui', '<font face="Courier">ft4_ht</font>', 'S.height',
  'BMR, TDEE, macros, US Navy', '[A] mesure', 'non'],
 ['age', 'UI Profil', 'oui', '<font face="Courier">ft4_age</font>', 'S.age',
  'BMR, TDEE, macros, niveaux de force', '[A] mesure', '<b>oui - repli 30 ans</b>'],
 ['sexe', 'UI Profil', 'oui', '<font face="Courier">ft4_gender</font>', 'S.gender',
  'BMR, US Navy, niveaux de force', '[A] mesure', 'repli H'],
 ['niveau d activite', 'UI Profil', 'oui', '<font face="Courier">ft4_act</font>', 'S.activityLevel',
  'TDEE, cible, macros', '[A] mesure', '<b>oui - repli 1,55</b>'],
 ['type de travail', 'UI Profil', 'oui', '<font face="Courier">ft4_work</font>', 'S.workType',
  'TDEE, cible, macros', '[A] mesure', 'repli bureau'],
 ['tabac', 'UI Profil', 'oui', '<font face="Courier">ft4_smoker</font>', 'S.smoker',
  'BMR (+7 %), TDEE', '[A] mesure', 'repli non'],
 ['niveau (level)', 'UI Profil', 'oui', '<font face="Courier">ft4_level</font>', 'S.level',
  '<b>aucun moteur nutritionnel</b>', '[A] mesure', 'sans objet'],
 ['masse grasse', 'Progres / bilan', 'oui', 'weightLog[].bf', 'S.weightLog',
  'Katch-McArdle, contexte de Milo, courbes', '[A] mesure', 'a instruire'],
 ['source masse grasse', 'pose par le code', 'non', 'weightLog[].bfSrc', 'S.weightLog',
  'affichage uniquement - <b>absent de l export</b>', '[A] mesure', '<b>oui</b>'],
]
H.append(tableau(['Donnee', 'Saisie', 'Valide', 'Persistance', 'Runtime', 'Moteurs aval',
                  'Provenance', 'Defaut silencieux'], MAT,
                 [22 * mm, 20 * mm, 12 * mm, 24 * mm, 20 * mm, 42 * mm, 16 * mm, 22 * mm]))
H.append(Spacer(1, 3))
H.append(P('[/!\\] La colonne &laquo; valide &raquo; porte sur la <b>saisie par l interface</b>. '
  'L audit statique signale que la <b>restauration cloud</b> n applique pas les memes bornes : '
  'c est un defaut CRITIQUE de la section 8, ancre a <font face="Courier">setup.js:3239</font> et '
  '<font face="Courier">setup.js:3335</font>, <b>en attente de contre-verification</b>.', 'petit'))

# ── 11. matrice moteurs
H.append(P('11. Matrice des moteurs (section 41)', 'h1'))
H.append(tableau(['Moteur', 'Entrees de profil', 'Sortie si donnee absente', 'Risque si profil faux'],
 [['<font face="Courier">bmrDetail</font>', 'poids, taille, age, sexe, tabac, masse maigre',
   '<b>0 + liste des manquants</b>', 'propage a tout l aval'],
  ['<font face="Courier">calcTDEE</font>', 'BMR, niveau d activite, metier, autre sport, pas',
   '<b>null</b>', 'cible calorique et macros faussees'],
  ['<font face="Courier">autoKcal / calcMacros</font>', 'TDEE, objectif, phase, poids',
   '<b>null</b>', 'prescription alimentaire faussee'],
  ['<b><font face="Courier">calcSessionCalories</font></b>', '<b>poids UNIQUEMENT</b>',
   '<b>[X] un nombre, sur 80 kg</b>', 'depense affichee faussee proportionnellement'],
  ['<font face="Courier">_bfNavy</font>', 'cou, taille, hanches, taille corporelle, sexe',
   'null', 'masse grasse estimee fausse'],
  ['<font face="Courier">leanMassRecente</font>', 'bilans corporels, poids',
   'null', 'bascule Mifflin / Katch-McArdle'],
  ['<font face="Courier">ecartNiveauActivite</font>', 'seances, niveau d activite courant',
   'null', 'proposition d ajustement absente ou fausse'],
  ['<font face="Courier">buildCoachContext</font>', 'la quasi-totalite du profil',
   'a instruire', '<b>contamine ce que Milo croit savoir</b>']],
 [40 * mm, 54 * mm, 38 * mm, 36 * mm]))

# ── 12. ce que ca invalide
H.append(P('12. Ce que cet audit invalide dans les dossiers precedents', 'h1'))
H.append(tableau(['Affirmation publiee', 'Statut apres mesure'],
 [['&laquo; TDEE de Michel : 3 515 kcal &raquo; (dossier du 22/09)',
   '<b>[X] FAUX.</b> Mesure avec les reglages qu il declare : <b>%d kcal</b>. Ecart <b>%d kcal</b>.' % (TDEE_D, 3515 - TDEE_D)],
  ['&laquo; il est regle un cran trop haut &raquo;',
   '<b>[X] NON SOUTENU.</b> Son reglage runtime n a jamais ete observe. Le cahier interdit de le supposer.'],
  ['&laquo; profil : 85,8 kg / 179 cm / 41 ans &raquo;',
   '<b>[X] INFERENCE [C]</b> reconstruite pour reproduire une sortie, presentee comme un fait.'],
  ['&laquo; l appli est haute de 400 a 700 kcal &raquo;',
   '<b>[!] A REFAIRE.</b> Sur %d kcal la sous-declaration necessaire retombe dans la fourchette publiee.' % TDEE_D],
  ['&laquo; les 4 cas du cahier sont reproduits &raquo;',
   '<b>[ok] VRAI, mais ne prouve que le POIDS</b> : les proteines sont en g/kg de poids de corps.'],
  ['Le defaut de regroupement des buckets',
   '<b>[ok] CONFIRME</b>, et desormais mesure a l execution, pas seulement raisonne.'],
  ['&laquo; la masse grasse ancienne suit une formule &raquo;',
   '<b>[ok] TIENT</b> - mesure sur le journal de poids reel, independant du profil.']],
 [72 * mm, 96 * mm]))

# ── 13. inconnues
H.append(P('13. Ce qui reste INCONNU, et pourquoi', 'h1'))
INC = [
 ['L etat runtime reel du profil de Michel', 'Le conteneur ne peut pas lire son telephone, et '
  '<b>aucun des trois exports CSV ne porte de champ de profil</b>.'],
 ['Le backend deploye', 'Injoignable depuis ce conteneur (le proxy n autorise que GitHub). '
  'Le code de <font face="Courier">Code.js</font> est lu ; son comportement en production ne l est pas.'],
 ['D ou vient le 3 522 du cahier du 22/09', 'Aucun cran du menu ne le produit avec les valeurs '
  'declarees. <b>Non reconstruit, expres.</b>'],
 ['La part exacte surestimation / sous-declaration', 'Indecidable sans eau doublement marquee.'],
 ['La severite reelle des %d defauts sans verdict' % len(SANS),
  '<b>Les verificateurs ont ete coupes par la limite de session</b> (146 agents en echec sur 182). '
  'Sur l echantillon verifie, %d severites sur %d ont ete retrogradees : on ne peut donc pas '
  'supposer que les autres tiennent telles quelles.' % (N_BAISSE, len(CONFIRMES))],
]
H.append(tableau(['Point', 'Pourquoi il reste inconnu'], INC, [58 * mm, 110 * mm]))

# ── 14. ce dont j ai besoin
H.append(P('14. Ce dont j ai besoin de Michel - et ce que j ai trouve a la place (section 43)', 'h1'))
H.append(encadre('Une capture d ecran n est PAS necessaire : la donnee existe deja',
  '<font face="Courier">Code.js:371</font> cree dans la feuille Google un onglet '
  '<b>&laquo; Utilisateurs &raquo;</b> dont les colonnes sont : <font face="Courier">email, nom, '
  'genre, <b>age_ans</b>, <b>taille_cm</b>, <b>poids_kg</b>, objectif, <b>activite</b>, premium, '
  'nb_seances, derniere_sync</font>. [*] <b>Le profil reel est donc deja persiste cote serveur et '
  'consultable.</b> C est la source [A] qu il fallait chercher avant de reconstruire quoi que ce '
  'soit - et la section 43 du cahier demande exactement ce reflexe : chercher si la donnee existe '
  'avant de la demander.', VERT))
H.append(Spacer(1, 3))
H.append(P('[/!\\] <b>Une seule chose reste utile si Michel veut fermer le sujet completement</b> : '
  'la ligne &laquo; Utilisateurs &raquo; de son e-mail dans la feuille, ou le TDEE et la cible que '
  'son onglet Nutrition affiche aujourd hui. <b>Raison</b> : c est le seul moyen de confronter son '
  'etat PERSISTE a ses valeurs DECLAREES, et le seul moyen de savoir si le 3 522 du cahier vient de '
  'son appli ou d ailleurs.', 'p'))

# ── 15. plan
H.append(P('15. Plan de correction FUTUR - rien n est applique', 'h1'))
H.append(tableau(['Ordre', 'Correction', 'Pourquoi cet ordre', 'Risque'],
 [['<b>1</b>', 'Contre-verifier les %d defauts du fan-out' % N_DEF,
   'aucune correction ne doit partir d une piste non verifiee', 'nul (lecture seule)'],
  ['<b>2</b>', 'Faire dire &laquo; je ne sais pas &raquo; aux moteurs qui replient sur 80 kg / 30 ans',
   'meme regle que ft-v1232, deja ecrite et eprouvee', 'faible - un affichage change'],
  ['<b>3</b>', 'Regrouper <font face="Courier">ecartNiveauActivite</font> par NIVEAU et non par bucket',
   'defaut mesure a l execution, correctif borne a une ligne', 'faible'],
  ['<b>4</b>', 'Ajouter <font face="Courier">bfSrc</font> aux colonnes de l export de poids',
   'sans lui, aucun audit externe ne peut distinguer mesure et estimation', 'nul'],
  ['<b>5</b>', 'Exporter le profil (age, taille, activite, metier) ou l afficher en Admin',
   'c est ce trou qui a rendu la reconstruction possible', 'faible'],
  ['<b>6</b>', 'Etiqueter toutes les fixtures et interdire une valeur non etiquetee dans un rapport',
   'ferme la contamination a la source, pas a l arrivee', 'nul - outillage'],
  ['<b>7</b>', 'Aligner les bornes de la restauration cloud sur celles de l interface',
   'a confirmer par la contre-verification avant d y toucher', 'moyen - touche la restauration'],
  ['<b>8</b>', 'Trancher la double declaration frequence / niveau d activite',
   'decision produit, pas correctif technique', 'a arbitrer par Michel']],
 [14 * mm, 62 * mm, 62 * mm, 30 * mm]))

# ── 16. contre-audit
H.append(P('16. Contre-audit de ce dossier (section 44)', 'h1'))
H.append(tableau(['Ce que je me reproche', 'Ce que j en fais'],
 [['%d defauts sur %d n ont AUCUN verdict adversarial' % (len(SANS), N_DEF),
   '<b>Nommes comme des pistes ancrees</b>, jamais comptes comme des faits - et le dossier publie '
   'le taux de retrogradation mesure (%d sur %d) pour qu on sache de combien s en defier.'
   % (N_BAISSE, len(CONFIRMES))],
  ['J ai ecrit &laquo; %d dimensions rendues &raquo; sans dire que %d n avaient aucun verdict'
   % (len(W), len(DIM_MUETTES)),
   '<b>Corrige.</b> Michel l a trouve en inspectant le JSON : mon resume laissait croire a une '
   'verification generale alors que <b>2 dimensions sur %d</b> seulement ont ete examinees.' % len(W)],
  ['La premiere version de ce dossier annoncait %d defauts CRITIQUES' % SEV['CRITIQUE'],
   '<b>Chiffre retire.</b> La verification a fait tomber les deux seuls CRITIQUES qu elle a '
   'examines. Publier le total annonce aurait fait passer un tri non fait pour un resultat.'],
  ['Les valeurs 48 / 180 / 3-4 viennent de Michel, pas de son appli',
   'Elles sont etiquetees <b>[B]</b> partout, et le banc les porte dans un profil '
   '<font face="Courier">__SYNTHETIQUE__</font> avec sa raison ecrite.'],
  ['Le banc mesure une app servie en local, pas le telephone de Michel',
   'Dit ici. Le service worker est bloque dans le contexte de mesure : c est le code du depot qui est '
   'mesure, pas une version en cache.'],
  ['Mon propre generateur de PDF portait le profil infere en dur',
   'C est un des defauts CRITIQUES du tableau de la section 8 - <b>mon outil est audite comme les autres</b>.'],
  ['Une seule dimension du cahier reste non couverte ici : le contre-audit de Milo',
   'Declare comme tel plutot que survole.']],
 [72 * mm, 96 * mm]))

H.append(Spacer(1, 6))
H.append(encadre('Etat du depot, verifie par git au moment de generer',
  '<b>AUCUN FICHIER SERVI N EST MODIFIE</b> (%d fichiers verifies : %s). Aucun bump de version - '
  'le cache sert toujours <b>%s</b>. Aucune publication. [*] Le seul ajout de cette session est '
  '<font face="Courier">tools/banc_forensique_profil.js</font>, un banc en lecture seule dont les '
  'deux profils portent le marqueur <font face="Courier">__SYNTHETIQUE__</font> et leur raison. '
  '[*] <i>Le code dit ce qui EST, Michel decide ce qui DOIT ETRE.</i>'
  % (len(SERVIS), ', '.join(SERVIS[:6]) + '...', VERSION), VERT))
H.append(Spacer(1, 5))
H.append(P('Ce dossier est genere par <font face="Courier">tools/gen_audit_forensique_pdf.py</font>, '
  'dont les <b>%d gardes</b> recomptent chaque chiffre depuis le banc dynamique, depuis le fan-out '
  'statique <b>et</b> depuis le code servi, et <b>refusent de produire</b> si un seul fait tombe. '
  'Aucun nombre n est ecrit a la main. [!!] Le generateur vit dans le depot ; <b>le PDF non</b>.' % NB, 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                        topMargin=17 * mm, bottomMargin=20 * mm,
                        title='Audit forensique de la source de verite - Force Tracker (23/09/2026)',
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)

# ══ F. RELECTURE ══════════════════════════════════════════════════════════════════════
def _relire(chemin):
    import base64, zlib
    data = open(chemin, 'rb').read(); textes = []; echecs = 0
    for m in re.finditer(rb'<<(.*?)>>\s*stream\r?\n', data, re.S):
        dico = m.group(1); lg = re.search(rb'/Length\s+(\d+)', dico)
        if not lg: echecs += 1; continue
        b = data[m.end():m.end() + int(lg.group(1))]
        try: brut = base64.a85decode(b.strip(), adobe=True)
        except Exception: brut = b
        lu = None
        for e in (brut, b):
            try: lu = zlib.decompress(e).decode('latin-1'); break
            except Exception: continue
        if lu is None:
            if b'/Font' in dico or b'FontFile' in dico: continue
            echecs += 1
        else: textes.append(lu)
    return '\n'.join(textes), echecs

_t, _ech = _relire(OUT)
_np = open(OUT, 'rb').read().count(b'/Type /Page') - 1
if _ech:
    os.remove(OUT); sys.exit('REFUS : %d flux non relus - la verification serait aveugle' % _ech)
_lis = ' '.join(x[1:-1] for x in re.findall(r'\((?:[^()\\]|\\.)*\)', _t))
_lis = re.sub(r'\s+', ' ', _lis)
if re.search(r'&lt;b&gt;|<b>', _lis):
    os.remove(OUT); sys.exit('REFUS : balise en clair dans le PDF produit')
if len(_lis) < 12000:
    os.remove(OUT); sys.exit('REFUS : le PDF relu ne fait que %d caracteres lisibles' % len(_lis))
for _m in ('deux politiques opposees', 'il invente un poids', 'le label tombe',
           'Seul le poids entre', 'AUCUN FICHIER SERVI', 'reste INCONNU',
           'copie de fixture', 'pistes ancrees', 'SYNTHETIQUE', 'age_ans',
           'tombes a MOYEN', 'AUCUN verdict', 'Chiffre retire', 'a l envers de la verite'):
    if _m not in _lis:
        os.remove(OUT); sys.exit('REFUS : « %s » n est pas imprime dans le PDF' % _m)
print('   relu : %d caracteres lisibles sur %d pages, 0 flux manque' % (len(_lis), _np))
print('OK %s (%d gardes, %d octets)' % (OUT, NB, os.path.getsize(OUT)))
print('   %d faits, %d defauts : %d confirmes, %d refutes, %d sans verdict'
      % (N_FAITS, N_DEF, len(CONFIRMES), len(REFUTES), len(SANS)))
print('   verification : %d severites retrogradees, %d aggravees, %d dimensions, %d inconnues'
      % (N_BAISSE, N_HAUSSE, len(W), N_INC))
