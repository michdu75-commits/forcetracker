#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PDF du DOSSIER-CORRECTION-T01-IDENTITE-LIGNE-FOODLOG. 31e document de la serie.

Rend en PDF le Markdown /tmp/DOSSIER-CORRECTION-T01-IDENTITE-LIGNE-FOODLOG-16-09-2026.md
(surchargeable par FT_MD) et REFUSE de produire si l un des faits qu il affirme ne se
retrouve pas dans le code servi.

⛔ CE DOSSIER DECRIT UNE CORRECTION, PAS UNE MESURE. Ses gardes protegent donc :
   ① le MECANISME retenu (les proprietaires, les 3 ecrivains, la cle d edition/suppression) ;
   ② les DECISIONS qui se perdent le plus vite : que `ts` reste un horodatage, que
      `saveEditFood` ne fabrique PAS d identite, que la compatibilite ne soit PAS un
      drapeau one-time, et que la fusion multi-onglets n emploie toujours pas l identite ;
   ③ le PERIMETRE (la douane intacte).
   ⭐ Une correction dont on republie le dossier apres l avoir defaite serait indetectable
      autrement : c est tout l interet de recompter depuis le code servi.

CONTRAINTE : WinAnsi/cp1252 — pas d emoji. Sortie hors depot (regle d or #14)."""
import html, os, re, subprocess
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

ROOT = os.environ.get('FT_ROOT') or '/home/user/forcetracker'
MD   = os.environ.get('FT_MD')   or '/tmp/DOSSIER-CORRECTION-T01-IDENTITE-LIGNE-FOODLOG-16-09-2026.md'
OUT  = os.environ.get('FT_OUT')  or '/tmp/DOSSIER-CORRECTION-T01-IDENTITE-LIGNE-FOODLOG-16-09-2026.pdf'

def _lire(p):
    with open(os.path.join(ROOT, p), encoding='utf-8') as f: return f.read()
APP = _lire('app.js'); SCR = _lire('screens.js'); ST = _lire('state.js')
SW  = _lire('sw.js');  RUN = _lire('tests/parcours/runner.js')
VERSION = (re.search(r"const CACHE ?= ?'(ft-v\d+)'", SW) or [None, '?'])[1]
TXT = open(MD, encoding='utf-8').read()

# ── le CODE, debarrasse de ce qui en PARLE (famille ft-v1193/1203/1205/1210) ──
def _nu(t):
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), t)
    return '\n'.join(l for l in t.split('\n') if not l.strip().startswith('//'))
APP_NU = _nu(APP); SCR_NU = _nu(SCR); ST_NU = _nu(ST); RUN_NU = _nu(RUN)

def _corps(src, entete):
    """Corps REEL d une fonction, borne aux ACCOLADES — jamais a une distance en
    caracteres (BUGS.md §63 : une borne en distance deborde sur la voisine)."""
    m = re.search(r'(?:async )?function ' + re.escape(entete) + r'\s*\(', src)
    if not m: return ''
    j = src.index('{', m.end() - 1); p = 0
    for k in range(j, len(src)):
        if src[k] == '{': p += 1
        elif src[k] == '}':
            p -= 1
            if p == 0: return _nu(src[m.start():k + 1])
    return ''

def _exige(cond, msg):
    if not cond: raise SystemExit('GARDE : ' + msg)

# ═══ 1. LE DEPOT ET LA VERSION ══════════════════════════════════════════════
_head = subprocess.run(['git', '-C', ROOT, 'rev-parse', '--short=8', 'HEAD'],
                       capture_output=True, text=True).stdout.strip() or '?'
_exige(VERSION in TXT or 'ft-vNN' in TXT,
       'le dossier ne cite pas la version servie (%s) : il decrirait un autre code.' % VERSION)

# ═══ 2. LES TROIS PROPRIETAIRES EXISTENT, ET UN SEUL DE CHAQUE (R2) ═════════
for _n in ('_foodLineId', '_foodIdAttr', '_foodLogIdentifier'):
    _vu = len(re.findall(r'function ' + _n + r'\s*\(', ST_NU))
    _exige(_vu == 1,
           'le proprietaire `%s` est defini %d fois au lieu d une : le §5.2 du dossier '
           'affirme qu il y en a UN seul (R2).' % (_n, _vu))
    _exige(_n in TXT, 'le proprietaire `%s` a disparu du dossier.' % _n)

# ═══ 3. LES TROIS ECRIVAINS CREATEURS POSENT L IDENTITE ════════════════════
for _w in ('rejouerRepas', 'quickAddFood', 'addFoodEntry'):
    _b = _corps(APP, _w)
    _exige(_b and 'id:_foodLineId()' in _b.replace(' ', ''),
           'l ecrivain `%s` ne pose plus l identite dans le litteral de la ligne : le §9 du '
           'dossier l affirme, et une ligne sans identite part au cloud sans poignee.' % _w)
_N = len(re.findall(r'_foodLineId\(\)', APP_NU))
_exige(_N == 3,
       '`_foodLineId()` est appele %d fois dans app.js au lieu de 3 : le §9 du dossier enumere '
       'exactement les trois ecrivains CREATEURS.' % _N)

# ═══ 4. ⛔ `saveEditFood` N EN POSE PAS — C EST UNE DECISION (R30) ══════════
_exige('_foodLineId(' not in _corps(APP, 'saveEditFood'),
       '`saveEditFood` FABRIQUE MAINTENANT UNE IDENTITE : le §9 du dossier explique qu il '
       'edite EN PLACE et qu une ligne corrigee reste la meme ligne. Si c est devenu faux, '
       'le dossier doit etre refait, pas republie.')

# ═══ 5. L EDITION ET LA SUPPRESSION N EMPLOIENT PLUS `ts` ═════════════════
for _f in ('openEditFood', 'saveEditFood', 'confirmRemoveFood', 'removeFoodEntry',
           '_efQtyRender', '_efApplyGrams'):
    _b = _corps(APP, _f)
    _exige(_b, 'la fonction `%s` a disparu : le dossier la cite.' % _f)
    _exige('.ts===' not in _b.replace(' ', '') and '.ts!==' not in _b.replace(' ', ''),
           '`%s` retrouve de nouveau la ligne par `ts` : c est EXACTEMENT le bug que ce '
           'dossier declare corrige.' % _f)

# ═══ 6. ⭐⭐ L ANNONCE ET L ACTION EMPLOIENT LA MEME CLE ═══════════════════
_exige('x.id===id' in _corps(APP, 'confirmRemoveFood').replace(' ', ''),
       '`confirmRemoveFood` ne nomme plus la ligne par son identite : le §11 du dossier en '
       'fait le fait le plus grave du chantier (l ecran annoncait « PAIN » et effacait tout).')
_rfe = _corps(APP, 'removeFoodEntry').replace(' ', '')
_exige('findIndex(' in _rfe and 'splice(i,1)' in _rfe and '.filter(' not in _rfe,
       '`removeFoodEntry` ne retire plus UN element par construction : le §12 affirme que le '
       'passage de `filter` a un retrait par index est la lecon du bug.')

# ═══ 7. LA POIGNEE DU RENDU, ET LA 2e PORTE DE SUPPRESSION ════════════════
_exige("openEditFood('${_h}')" in SCR_NU and "confirmRemoveFood('${_h}')" in SCR_NU
       and '_foodIdAttr(e.id)' in SCR_NU,
       'le journal ne passe plus l identite : le §2 (#17/#18) du dossier decrit la poignee.')
_exige('_foodIdAttr(id)' in _corps(APP, 'openEditFood'),
       'le bouton « Supprimer » DE LA MODALE n emploie plus la meme poignee : c est la 2e porte '
       'de suppression (#15 de l inventaire), et le dossier insiste sur le fait qu elle est '
       'facile a oublier.')

# ═══ 8. ⭐ `ts` RESTE UN HORODATAGE — LE CHOIX D ARCHITECTURE ═════════════
_exige(not re.search(r'ts:\s*Date\.now\(\)\s*\+', APP_NU),
       'UN ECRIVAIN FABRIQUE UN `ts` ARTIFICIELLEMENT UNIQUE : le §3 et le §4 du dossier '
       'ECARTENT nommement l option A, parce que `_profilAlimentaire` lit l HEURE du `ts`.')
_exige(not re.search(r'\.ts\s*=[^=]', _corps(ST, '_foodLogIdentifier')),
       'la compatibilite REECRIT un horodatage : le §8 du dossier affirme que `ts` reste 123 '
       'sur les lignes historiques.')
_exige('new Date(e.ts).getHours()' in APP_NU.replace(' ', '')
       or re.search(r'new Date\(e\.ts\)\.getHours\(\)', APP_NU),
       'le seul usage qui lit l HEURE du `ts` a disparu : c est lui qui TRANCHE le choix '
       'd architecture du §3. Sans lui, l argument du dossier ne tient plus.')

# ═══ 9. LA COMPATIBILITE : IDEMPOTENTE, SANS DRAPEAU, ET N ECRIT QUE l.id ══
_b = _corps(ST, '_foodLogIdentifier')
_ecrit = [s.rstrip('=').strip() for s in re.findall(r'\bl\.[a-zA-Z0-9_]+\s*=[^=]', _b)]
_ecrit = [re.sub(r'\s*=.$', '', s).strip() for s in
          re.findall(r'\bl\.[a-zA-Z0-9_]+\s*=[^=]', _b)]
_exige(len(_ecrit) == 1 and _ecrit[0] == 'l.id',
       'la compatibilite ecrit %s au lieu du seul `l.id` : le §8 du dossier promet qu une '
       'ancienne ligne gagne UNIQUEMENT ce qui lui manquait.' % (', '.join(_ecrit) or 'rien'))
_exige(not re.search(r'ft4_[a-z0-9_]*mig', _b),
       'LA COMPATIBILITE EST GARDEE PAR UN DRAPEAU one-time : le §7 du dossier en fait la '
       'decision centrale (une restauration reinjecte de vieilles lignes des mois plus tard).')
_exige('!vus[cle]' in _b.replace(' ', ''),
       'la compatibilite ne reattribue plus un identifiant EN DOUBLE : elle exigerait la '
       'PRESENCE au lieu de l UNICITE, ce qui rejouerait le bug avec une autre cle (§7).')
_exige(len(re.findall(r'_foodLogIdentifier\(S\.foodLog\)', ST_NU)) >= 2,
       'la compatibilite n est plus rejouee au chargement ET a la fusion (§7).')
_exige('_foodLogIdentifier(S.foodLog)' in _corps(SCR, 'renderFoodJournal'),
       'LE FILET DU RENDU A DISPARU : c est lui qui couvre la RESTAURATION (§7 et §14). Sans '
       'lui une ligne restauree n a aucune poignee — ni editable, ni supprimable.')

# ═══ 10. ⛔ AUCUN Math.random, AUCUN REPLI SUR L HORLOGE ══════════════════
_g = _corps(ST, '_foodLineId')
_exige('Math.random' not in _g, 'l identite vient de `Math.random` : interdit nommement (§5.3).')
_exige('crypto.randomUUID' in _g and 'crypto.getRandomValues' in _g,
       'le fabricant n emploie plus les primitives citees au §5.3.')
_exige('Date.now' not in _g,
       'le fabricant retombe sur l horloge : le §5.3 affirme qu on echoue FERME plutot que '
       'd inventer une identite qui pourrait percuter.')

# ═══ 11. ⛔ HORS PERIMETRE, FIGE : LA FUSION ET LA DOUANE ═════════════════
_fus = re.search(r"S\.foodLog\s*=\s*_fusionListe\([\s\S]{0,400}?\);", ST_NU)
_exige(_fus and '.ts' not in _fus.group(0) and '.id' not in _fus.group(0),
       'la signature de fusion de `foodLog` emploie maintenant `ts` ou `id` : le §15 du dossier '
       'explique que ce serait CREER le doublon que la fusion evite.')
_d = APP[APP.index('function _douaneLigne'):APP.index('function _douaneCompter')]
_R = re.findall(r"dit\('[a-z0-9_]+',\s*'(INVALID|WARN)'", _d)
_exige(len(_R) == 21 and _R.count('INVALID') == 9,
       'LA DOUANE A CHANGE : %d regles (%d INVALID) au lieu de 21 / 9. Le §16 du dossier '
       'affirme qu elle est intacte — c est une promesse de perimetre.'
       % (len(_R), _R.count('INVALID')))

# ═══ 12. LE CONVERTISSEUR VIT DANS LE BANC, PAS DANS LE PRODUIT ══════════
_exige('_tsVersId' in RUN_NU,
       'le convertisseur des temoins a disparu du banc : le §19 explique pourquoi il vit LA '
       'et pas dans le produit.')
_exige('_tsVersId' not in APP_NU + SCR_NU + ST_NU,
       'LE CONVERTISSEUR A MIGRE DANS LE PRODUIT : un repli sur `ts` rend la PREMIERE ligne '
       'du groupe, donc il rouvrirait la porte exacte qu on ferme (§19).')

# ═══ 13. LES DEUX BLOCS DE TEMOINS SONT LA ═══════════════════════════════
# ⛔ LES BLOCS ONT ETE RENUMEROTES A LA FUSION DU 16/09 : l autre session avait pris
#    B-CCCXII et B-CCCXIII le meme jour. Je publie en dernier, donc je renumerote les MIENS.
#    Le garde suit — sinon il mesurerait les blocs de l autre session en croyant mesurer
#    les miens, ce qui est pire qu un garde absent.
for _bl in ('B-CCCXIV', 'B-CCCXV'):
    _exige(_bl in RUN, 'le bloc %s a disparu du banc : le §19 du dossier le cite.' % _bl)
    _exige(_bl in TXT, 'le bloc %s a disparu du dossier.' % _bl)
# ⛔ ET LES BLOCS DE L AUTRE SESSION DOIVENT ETRE RESTES ENTIERS : une fusion qui garde un
#    seul cote est une fusion qui efface le travail de quelqu un.
for _bl in ('B-CCCXII ', 'B-CCCXIII '):
    _exige(_bl in RUN,
           'le bloc %s de l AUTRE session a disparu du banc : la fusion du 16/09 devait '
           'conserver les deux cotes.' % _bl.strip())

# ═══ 14. L INSTANTANE EST DANS LE DEPOT ET REJOUABLE ═════════════════════
_exige(os.path.exists(os.path.join(ROOT, 'tools/instantane_foodlog_identite.js')),
       'l instantane du §17 n est plus dans le depot : un instantane qu on ne peut pas rejouer '
       'n est plus une mesure, c est un souvenir.')

# ═══ 15. LE DOSSIER REPOND AUX 7 QUESTIONS, ET AUX 22 SECTIONS ═══════════
for _n in range(1, 23):
    _exige(re.search(r'^# %d\. ' % _n, TXT, re.M),
           'la section %d des 22 demandees manque.' % _n)
_rep = re.findall(r'^## \*\*(OUI|NON|PARTIEL)\*\*$', TXT, re.M)
_exige(len(_rep) == 7,
       'le dossier porte %d reponses finales au lieu des 7 demandees (OUI / NON / PARTIEL).'
       % len(_rep))
_exige(not re.search(r'\b(normalement|devrait etre|devrait |ca devrait)\b', TXT, re.I),
       'LE DOSSIER EMPLOIE « normalement » OU « devrait » : Michel les interdit nommement '
       'dans les questions finales. Une reponse se mesure.')

N_GARDES = len(re.findall(r'_exige\(', open(os.path.abspath(__file__), encoding='utf-8').read())) - 1

# ══════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B'); ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A'); FOND = colors.HexColor('#F4F4F2')
ss = getSampleStyleSheet()
S = {'h1': ParagraphStyle('h1', parent=ss['Title'], fontName='Helvetica-Bold', fontSize=16, leading=20,
                          textColor=ENCRE, alignment=0, spaceBefore=16, spaceAfter=6),
     'h2': ParagraphStyle('h2', parent=ss['Normal'], fontName='Helvetica-Bold', fontSize=11.5, leading=14,
                          textColor=ROUGE, spaceBefore=11, spaceAfter=4),
     'h3': ParagraphStyle('h3', parent=ss['Normal'], fontName='Helvetica-Bold', fontSize=9.8, leading=12.5,
                          textColor=ENCRE, spaceBefore=7, spaceAfter=3),
     'p':  ParagraphStyle('p', parent=ss['Normal'], fontName='Helvetica', fontSize=8.6, leading=11.8,
                          textColor=ENCRE, spaceAfter=3.5),
     'li': ParagraphStyle('li', parent=ss['Normal'], fontName='Helvetica', fontSize=8.6, leading=11.8,
                          textColor=ENCRE, leftIndent=9, bulletIndent=2, spaceAfter=2),
     'q':  ParagraphStyle('q', parent=ss['Normal'], fontName='Helvetica-Oblique', fontSize=9, leading=12.5,
                          textColor=ROUGE, leftIndent=10, spaceBefore=4, spaceAfter=5),
     'pt': ParagraphStyle('pt', parent=ss['Normal'], fontName='Helvetica-Oblique', fontSize=7.6, leading=10,
                          textColor=GRIS, spaceAfter=3),
     'pre': ParagraphStyle('pre', parent=ss['Normal'], fontName='Courier', fontSize=7.2, leading=9.2,
                           textColor=ENCRE, leftIndent=7, spaceAfter=2),
     'c':  ParagraphStyle('c', parent=ss['Normal'], fontName='Helvetica', fontSize=7.3, leading=9.4, textColor=ENCRE),
     'cb': ParagraphStyle('cb', parent=ss['Normal'], fontName='Helvetica-Bold', fontSize=7.3, leading=9.4, textColor=ENCRE)}

_EMO = re.compile('[\U0001F000-\U0001FAFF←-⇿⌀-➿⬀-⯿️‍]')
def _ok(ch):
    try: html.unescape(ch).encode('cp1252'); return True
    except Exception: return False
def inline(t, code=False):
    t = _EMO.sub('', t)
    t = t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    if not code:
        t = re.sub(r'`([^`]+)`', r'<font face="Courier" size="7.6">\1</font>', t)
        t = re.sub(r'\*\*\*(.+?)\*\*\*', r'<b><i>\1</i></b>', t)
        t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
        t = re.sub(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', r'<i>\1</i>', t)
    t = (t.replace('→', '-&gt;').replace('←', '&lt;-').replace('≥', '&gt;=')
          .replace('≤', '&lt;=').replace('×', 'x').replace('≠', '!=')
          .replace('‑', '-').replace('–', '-').replace(' ', ' ').replace(' ', ' '))
    return ''.join(ch if _ok(ch) else '' for ch in t)

H = []; buf = []
def vider():
    global buf
    if not buf: return
    d = [[Paragraph(inline(c), S['cb' if i == 0 else 'c']) for c in ln] for i, ln in enumerate(buf)]
    n = max(len(r) for r in d)
    d = [r + [Paragraph('', S['c'])] * (n - len(r)) for r in d]
    larg = (A4[0] - 30 * mm) / n
    t = Table(d, colWidths=[larg] * n, repeatRows=1)
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.35, colors.HexColor('#D8D8D4')),
        ('BACKGROUND', (0, 0), (-1, 0), FOND),
        ('LEFTPADDING', (0, 0), (-1, -1), 3.5), ('RIGHTPADDING', (0, 0), (-1, -1), 3.5),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5)]))
    H.append(t); H.append(Spacer(1, 5)); buf = []

dans_code = False
for ligne in TXT.split('\n'):
    l = ligne.rstrip()
    if l.strip().startswith('```'):
        vider(); dans_code = not dans_code; continue
    if dans_code:
        H.append(Paragraph(inline(l or ' ', code=True), S['pre'])); continue
    if re.match(r'^\|\s*[-: ]+\|', l): continue
    if l.startswith('|'):
        buf.append([c.strip() for c in l.strip('|').split('|')]); continue
    vider()
    if not l.strip() or l.strip() == '---': continue
    if l.startswith('### '):  H.append(Paragraph(inline(l[4:]), S['h3']))
    elif l.startswith('## '): H.append(Paragraph(inline(l[3:]), S['h2']))
    elif l.startswith('# '):  H.append(Paragraph(inline(l[2:]), S['h1']))
    elif l.startswith('> '):  H.append(Paragraph(inline(l[2:]), S['q']))
    elif re.match(r'^\s*[-*] ', l) or re.match(r'^\s*\d+\. ', l):
        H.append(Paragraph(inline(re.sub(r'^\s*([-*]|\d+\.) ', '', l)), S['li'], bulletText='•'))
    elif l.startswith('*') and l.endswith('*') and len(l) > 2:
        H.append(Paragraph(inline(l.strip('*')), S['pt']))
    else: H.append(Paragraph(inline(l), S['p']))
vider()

H.insert(0, Paragraph('%d gardes relisent le code servi (%s, depot %s) et refusent de produire '
                      'ce document si un fait ou une decision qu il affirme ne s y retrouve pas.'
                      % (N_GARDES, VERSION, _head), S['pt']))

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=15 * mm, rightMargin=15 * mm, topMargin=14 * mm,
                  bottomMargin=13 * mm, title='Correction T-01 - identite d une ligne du journal',
                  author='Force Tracker').build(H)
print('OK %s  (%s, depot %s, %d gardes)' % (OUT, VERSION, _head, N_GARDES))
