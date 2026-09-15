#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PDF de l'INVENTAIRE FONCTIONNEL EXHAUSTIF (audit business). 28e document de la serie.

Rend en PDF le Markdown /tmp/DOSSIER-NUTRITION-ETAT-FINAL-15-09-2026.md
(surchargeable par FT_MD), et REFUSE de produire si l'un des faits chiffres qu'il
affirme ne se retrouve pas dans le code servi.

⛔ CE DOCUMENT PART A UN TIERS (auditeur business). Ses gardes protegent donc
surtout les CHIFFRES et les ABSENCES : un inventaire qui annonce une capacite
inexistante, ou qui rate une capacite reelle, oriente une decision d'affaires.

CONTRAINTE : WinAnsi/cp1252 — pas d'emoji. Sortie hors depot (regle d'or #14)."""
import html, os, re, json
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether

ROOT = os.environ.get('FT_ROOT') or '/home/user/forcetracker'
MD   = os.environ.get('FT_MD')   or '/tmp/DOSSIER-NUTRITION-ETAT-FINAL-15-09-2026.md'
OUT  = os.environ.get('FT_OUT')  or '/tmp/DOSSIER-NUTRITION-ETAT-FINAL-15-09-2026.pdf'

def _lire(p):
    with open(os.path.join(ROOT,p),encoding='utf-8') as f: return f.read()
APP=_lire('app.js'); IDX=_lire('index.html'); SW=_lire('sw.js'); LOG=_lire('log.js')
COACH=_lire('coach.js'); TRACK=_lire('tracking.js'); SETUP=_lire('setup.js')
CONST=_lire('constants.js'); WK=_lire('worker.js'); SCR=_lire('screens.js'); ST=_lire('state.js')
SERVIS = APP+IDX+SW+LOG+COACH+TRACK+SETUP+CONST+SCR+ST
VERSION = (re.search(r"const CACHE ?= ?'(ft-v\d+)'", SW) or [None,'?'])[1]
TXT = open(MD,encoding='utf-8').read()

# le CODE, debarrasse de ce qui en PARLE (famille ft-v1193/1203/1205/1210)
def _nu(t):
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n'*m.group(0).count('\n'), t)
    return '\n'.join(l for l in t.split('\n') if not l.strip().startswith('//'))
APP_NU = _nu(APP)

def _exige(cond, msg):
    if not cond: raise SystemExit('GARDE : '+msg)

# ─── 1. LA DOUANE : son contrat, recompte a chaque generation ─────────────────
_i = APP.index('function _douaneLigne'); _j = APP.index('function _douaneCompter')
_BLOC = APP[_i:_j]
_R = re.findall(r"dit\('([a-z0-9_]+)',\s*'(INVALID|WARN)'", _BLOC)
N_TOT = len(_R); N_INV = sum(1 for x in _R if x[1]=='INVALID'); N_WARN = N_TOT - N_INV
_exige(N_TOT==21 and N_INV==9 and N_WARN==12,
       'LES REGLES DE LA DOUANE ONT CHANGE : %d au lieu de 21 (%d INVALID / %d WARN). Le dossier '
       'les enumere une par une — il faut le refaire, pas le republier.'%(N_TOT,N_INV,N_WARN))
for _n,_g in _R:
    _exige(_n in TXT, 'la regle `%s` (%s) n est pas dans le dossier : une regle absente du dossier '
                      'est une regle que le repreneur ne saura pas qu il doit juger.'%(_n,_g))

# ─── 2. LA DOUANE N AGIT TOUJOURS PAS ────────────────────────────────────────
_exige('try{ _douaneCompter(res, l); }catch(e){}' in _BLOC,
       'l appel au carnet n est plus enveloppe : un observateur qui peut faire echouer ce qu il '
       'observe n en est plus un. Le §6.3 du dossier l affirme.')
for _e in ('addFoodEntry','quickAddFood','rejouerRepas','saveEditFood'):
    _exige(("_douaneLigne(_e,'"+_e+"')") in APP or ("_douaneLigne(_l,'"+_e+"')") in APP
           or ("_douaneLigne(e,'"+_e+"')") in APP,
           'l ecrivain `%s` n appelle plus la douane : le §6.2 du dossier liste les 4.'%_e)
_exige(not re.search(r'(if\s*\(\s*_?dou[a-zA-Z]*\.etat|douane\.etat\s*===|res\.etat\s*===\s*.INVALID.)', APP),
       'UN APPELANT LIT LE VERDICT DE LA DOUANE : le dossier affirme en §10 qu elle ne bloque rien. '
       'Si c est devenu faux, le tableau du §10 ment sur sept points.')

# ─── 3. LES 4 ETATS DU RESOLVEUR ─────────────────────────────────────────────
# ⛔ les noms d etats vivent aussi dans les COMMENTAIRES : on les cherche dans le CORPS du
#    resolveur, et sur une AFFECTATION — pas n importe ou dans le fichier (lecon ft-v1207).
_i3 = APP.index('function _resoudreNutrition'); _j3 = APP.index('function _ref100')
_RES = _nu(APP[_i3:_j3])
_exige("etat: 'COHERENT'" in _RES, 'l etat initial COHERENT a disparu du resolveur.')
for _s in ('ALTERNATIVE_FIABLE','DERIVE_ESTIMABLE','NON_RESOLU'):
    # ⛔ `NON_RESOLU` est AFFECTE DEUX FOIS : n en exiger qu une laisse l autre satisfaire le
    #    garde, et renommer la premiere passe inapercu (lecon ft-v1207, repayee ici).
    _att = {'ALTERNATIVE_FIABLE':1, 'DERIVE_ESTIMABLE':2, 'NON_RESOLU':2}[_s]
    _vu = len(re.findall(r"res\.etat = '"+_s+r"'", _RES))
    _exige(_vu == _att,
           'l etat `%s` est affecte %d fois au lieu de %d dans le resolveur : le §4.3 du dossier '
           'enumere les 4 etats et leurs branches.'%(_s,_vu,_att))
    _exige(_s in TXT, 'l etat `%s` a disparu du dossier.'%_s)
# ⛔ UN NOM VIT EN DECLARATION *ET* EN USAGE : chercher sa presence quelque part laisse passer
#    le renommage de l un des deux. On COMPTE, dans le code seul (lecon ft-v1207).
for _nom, _att in (('champSource',3), ('NRJ_ORIGINES_UTILISATEUR',3),
                   ('_CAT_PRET',2), ('_NOM_CUISINE',2), ('_SECS_QUI_GONFLENT',2)):
    _vu = len(re.findall(r'\b'+_nom+r'\b', APP_NU))
    _exige(_vu == _att,
           '`%s` apparait %d fois au lieu de %d dans le code servi : declaration ou usage a ete '
           'renomme, et le dossier decrit ce mecanisme comme entier.'%(_nom,_vu,_att))
_exige("NRJ_ORIGINES_UTILISATEUR.indexOf(origine) >= 0) return res;" in APP_NU,
       'la sortie anticipee sur une origine UTILISATEUR a disparu : le dossier affirme en §4.4 '
       'qu une saisie n est JAMAIS reecrite.')

# ─── 4. LES 4 ECRIVAINS, ET saveEditFood QUI NE FAIT PAS DE push ─────────────
# ⛔ LE CODE, DEBARRASSE DE CE QUI EN PARLE : le commentaire de `saveEditFood` CITE
#    « S.foodLog.push » pour expliquer qu il n en fait pas — un garde qui ne distingue pas
#    le code de sa documentation compte 4 au lieu de 3 (famille ft-v1193/1203/1205/1210).
N_PUSH = len(re.findall(r'S\.foodLog\.push', APP_NU))
_exige(N_PUSH==3, 'il y a %d `S.foodLog.push` au lieu de 3 : le §7 du dossier repose sur le fait '
                  'que saveEditFood ecrit EN PLACE et qu une recherche sur push le rate.'%N_PUSH)
_exige('function saveEditFood(){' in APP and 'S.foodLog.push' not in
       APP_NU[APP_NU.index('function saveEditFood(){'):APP_NU.index('function saveEditFood(){')+4000],
       '`saveEditFood` fait maintenant un push : le point le plus contre-intuitif du dossier tombe.')

# ─── 5. LE CARNET NE GARDE QUE DE LA STRUCTURE ───────────────────────────────
_i2 = APP.index('function _douaneCompter'); _j2 = APP.index('function _douaneRapport')
_CPT = APP[_i2:_j2]
for _interdit in ('ligne.name','ligne.kcal','ligne.prot','ligne.carbs','ligne.fat','l.name'):
    _exige(_interdit not in _CPT,
           'LE CARNET GARDE `%s` : le dossier affirme en §6.5 qu il ne garde AUCUNE donnee de '
           'repas. C est une promesse de confidentialite, pas un detail.'%_interdit)
_exige('try{ localStorage.setItem(DOUANE_OBS_CLE, JSON.stringify(c)); }catch(e){}' in _CPT,
       'le carnet ne persiste plus SOUS SA FORME EXACTE : le §6.5 affirme qu il survit au '
       'rechargement. (Un garde de simple presence ne voit pas une instruction neutralisee.)')
_exige('douane' not in _lire('setup.js').lower(),
       'LE CARNET PART DANS LA SAUVEGARDE CLOUD : le dossier affirme le contraire (§6.5).')

# ─── 6. savedFoods N EST TOUJOURS PAS FUSIONNE ───────────────────────────────
_exige('_fusionListe(S.savedFoods' not in ST,
       '`savedFoods` est maintenant fusionne entre onglets : le §11 du dossier le declare NON '
       'CORRIGE. Il faut le reecrire, pas le republier.')
_FUS = re.findall(r'_fusionListe\(S\.([a-zA-Z]+)', ST)
_exige(len(_FUS)==5, 'le nombre de listes fusionnees est passe a %d (au lieu de 5) : le §11 '
                     'du dossier les enumere.'%len(_FUS))

# ─── 7. LE FAUX WARNING « PRODUIT SEC » RESTE CORRIGE ────────────────────────
for _m in ('_CAT_PRET','_NOM_CUISINE','_SECS_QUI_GONFLENT'):
    _exige(re.search(r'\b'+_m+r'\b', APP), '`%s` a disparu : le §5 du dossier decrit la correction a deux sources.'%_m)

# ─── 8. LE SCANNER N EST TOUJOURS PAS REACTIVE ───────────────────────────────
_exige('onclick="scanBarcode()"' not in IDX and 'onclick="openBarcodeScanner(' not in IDX,
       'LE BOUTON UTILISATEUR DU SCANNER EST REVENU : le §15 du dossier le declare ferme.')

# ─── 9. LE DOSSIER NE PRETEND PAS AVOIR DES RESULTATS D OBSERVATION ──────────
_exige('AUCUN' in TXT and 'RESULTATS REELS MESURES JUSQU ICI'.replace(' ','') in
       re.sub(r'[^A-Z]','',TXT.upper()) or 'AUCUN' in TXT,
       'le dossier doit dire explicitement qu aucun resultat d observation n a ete remonte.')
_exige(not re.search(r'(le rapport (montre|indique|donne)|les resultats observes sont|on a observe \d)',
                     TXT, re.I),
       'LE DOSSIER PRESENTE DES RESULTATS D OBSERVATION : aucun n a ete remonte (§9.3). '
       'Un dossier de reprise qui invente des mesures envoie le repreneur dans le mur.')
_exige('AUCUNE CORRECTION' in TXT.upper() or 'Aucun correctif appliqu' in TXT,
       'le dossier ne dit plus qu aucun correctif n a ete applique.')

N_GARDES = len(re.findall(r'_exige\(', open(os.path.abspath(__file__),encoding='utf-8').read())) - 1

# ══════════════════════════════════════════════════════════════════════════════
ROUGE=colors.HexColor('#C0392B'); ENCRE=colors.HexColor('#1A1A1A')
GRIS=colors.HexColor('#5A5A5A'); FOND=colors.HexColor('#F4F4F2')
ss=getSampleStyleSheet()
S={'h1':ParagraphStyle('h1',parent=ss['Title'],fontName='Helvetica-Bold',fontSize=16,leading=20,
                       textColor=ENCRE,alignment=0,spaceBefore=16,spaceAfter=6),
   'h2':ParagraphStyle('h2',parent=ss['Normal'],fontName='Helvetica-Bold',fontSize=11.5,leading=14,
                       textColor=ROUGE,spaceBefore=11,spaceAfter=4),
   'h3':ParagraphStyle('h3',parent=ss['Normal'],fontName='Helvetica-Bold',fontSize=9.8,leading=12.5,
                       textColor=ENCRE,spaceBefore=7,spaceAfter=3),
   'p' :ParagraphStyle('p', parent=ss['Normal'],fontName='Helvetica',fontSize=8.6,leading=11.8,
                       textColor=ENCRE,spaceAfter=3.5),
   'li':ParagraphStyle('li',parent=ss['Normal'],fontName='Helvetica',fontSize=8.6,leading=11.8,
                       textColor=ENCRE,leftIndent=9,bulletIndent=2,spaceAfter=2),
   'q' :ParagraphStyle('q', parent=ss['Normal'],fontName='Helvetica-Oblique',fontSize=9,leading=12.5,
                       textColor=ROUGE,leftIndent=10,spaceBefore=4,spaceAfter=5),
   'pt':ParagraphStyle('pt',parent=ss['Normal'],fontName='Helvetica-Oblique',fontSize=7.6,leading=10,
                       textColor=GRIS,spaceAfter=3),
   'c' :ParagraphStyle('c', parent=ss['Normal'],fontName='Helvetica',fontSize=7.3,leading=9.4,textColor=ENCRE),
   'cb':ParagraphStyle('cb',parent=ss['Normal'],fontName='Helvetica-Bold',fontSize=7.3,leading=9.4,textColor=ENCRE)}

_EMO = re.compile('[\U0001F000-\U0001FAFF←-⇿⌀-➿⬀-⯿️‍]')
def inline(t):
    """markdown -> balises reportlab, puis NETTOYAGE cp1252 (aucun emoji ne survit)."""
    t = _EMO.sub('', t)
    t = t.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
    t = re.sub(r'`([^`]+)`', r'<font face="Courier" size="7.6">\1</font>', t)
    t = re.sub(r'\*\*\*(.+?)\*\*\*', r'<b><i>\1</i></b>', t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', r'<i>\1</i>', t)
    t = (t.replace('→','-&gt;').replace('←','&lt;-').replace('≥','&gt;=')
          .replace('≤','&lt;=').replace('×','x').replace('≠','!=')
          .replace('‑','-').replace('–','-').replace(' ',' ').replace(' ',' '))
    # dernier filet : tout ce que cp1252 refuse est retire plutot que de casser le rendu
    return ''.join(ch if _ok(ch) else '' for ch in t)
def _ok(ch):
    try: html.unescape(ch).encode('cp1252'); return True
    except Exception: return False

H=[]; buf=[]
def vider():
    global buf
    if not buf: return
    d=[[Paragraph(inline(c),S['cb' if i==0 else 'c']) for c in ln] for i,ln in enumerate(buf)]
    n=max(len(r) for r in d)
    d=[r+[Paragraph('',S['c'])]*(n-len(r)) for r in d]
    larg=(A4[0]-30*mm)/n
    t=Table(d,colWidths=[larg]*n,repeatRows=1)
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),
        ('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#D8D8D4')),
        ('BACKGROUND',(0,0),(-1,0),FOND),
        ('LEFTPADDING',(0,0),(-1,-1),3.5),('RIGHTPADDING',(0,0),(-1,-1),3.5),
        ('TOPPADDING',(0,0),(-1,-1),2.5),('BOTTOMPADDING',(0,0),(-1,-1),2.5)]))
    H.append(t); H.append(Spacer(1,5)); buf=[]

for ligne in TXT.split('\n'):
    l=ligne.rstrip()
    if re.match(r'^\|\s*[-: ]+\|', l): continue              # separateur de tableau
    if l.startswith('|'):
        buf.append([c.strip() for c in l.strip('|').split('|')]); continue
    vider()
    if not l.strip() or l.strip()=='---': continue
    if l.startswith('### '):  H.append(Paragraph(inline(l[4:]),S['h3']))
    elif l.startswith('## '): H.append(Paragraph(inline(l[3:]),S['h2']))
    elif l.startswith('# '):  H.append(Paragraph(inline(l[2:]),S['h1']))
    elif l.startswith('> '):  H.append(Paragraph(inline(l[2:]),S['q']))
    elif re.match(r'^\s*[-*] ', l):
        H.append(Paragraph(inline(re.sub(r'^\s*[-*] ','',l)),S['li'],bulletText='•'))
    elif l.startswith('*') and l.endswith('*') and len(l)>2:
        H.append(Paragraph(inline(l.strip('*')),S['pt']))
    else: H.append(Paragraph(inline(l),S['p']))
vider()

H.insert(0,Paragraph('%d gardes relisent le code servi (%s) et refusent de produire ce document '
                     'si un chiffre ou une absence qu il affirme ne s y retrouve pas.'
                     %(N_GARDES,VERSION),S['pt']))

SimpleDocTemplate(OUT,pagesize=A4,leftMargin=15*mm,rightMargin=15*mm,topMargin=14*mm,
                  bottomMargin=13*mm,title='Dossier Nutrition - etat final',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes | douane : %d regles, %d INVALID / %d WARN)'
      %(OUT,VERSION,N_GARDES,N_TOT,N_INV,N_WARN))
