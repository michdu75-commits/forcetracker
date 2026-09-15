#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PDF de l'INVENTAIRE FONCTIONNEL EXHAUSTIF (audit business). 28e document de la serie.

Rend en PDF le Markdown /tmp/INVENTAIRE-FONCTIONNEL-FORCE-TRACKER-15-09-2026.md
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
MD   = os.environ.get('FT_MD')   or '/tmp/INVENTAIRE-FONCTIONNEL-FORCE-TRACKER-15-09-2026.md'
OUT  = os.environ.get('FT_OUT')  or '/tmp/INVENTAIRE-FONCTIONNEL-FORCE-TRACKER-15-09-2026.pdf'

def _lire(p):
    with open(os.path.join(ROOT,p),encoding='utf-8') as f: return f.read()
APP=_lire('app.js'); IDX=_lire('index.html'); SW=_lire('sw.js'); LOG=_lire('log.js')
COACH=_lire('coach.js'); TRACK=_lire('tracking.js'); SETUP=_lire('setup.js')
CONST=_lire('constants.js'); WK=_lire('worker.js'); SCR=_lire('screens.js'); ST=_lire('state.js')
SERVIS = APP+IDX+SW+LOG+COACH+TRACK+SETUP+CONST+SCR+ST
VERSION = (re.search(r"const CACHE ?= ?'(ft-v\d+)'", SW) or [None,'?'])[1]
TXT = open(MD,encoding='utf-8').read()

def _exige(cond, msg):
    if not cond: raise SystemExit('GARDE : '+msg)

# ─── 1. VOLUMETRIE — recomptee, jamais recopiee ───────────────────────────────
_i = CONST.index('const EXLIB=['); _j = CONST.index('[',_i); _p=0; _k=_j
while _k < len(CONST):
    if CONST[_k]=='[': _p+=1
    elif CONST[_k]==']':
        _p-=1
        if _p==0: break
    _k+=1
_BLOC = re.sub(r'//[^\n]*', '', CONST[_j:_k+1])          # les commentaires JS ne sont pas du JSON
N_EX  = len(re.findall(r"\{\s*n\s*:", _BLOC))
N_GRP = len(set(re.findall(r"g\s*:\s*'([^']+)'", _BLOC)))
_exige(str(N_EX) in TXT, 'le document annonce un nombre d exercices different du catalogue reel (%d).'%N_EX)
_exige(('%d groupes'%N_GRP) in TXT or ('**%d** groupes'%N_GRP) in TXT or (str(N_GRP)+' groupes') in TXT,
       'le nombre de groupes d exercices (%d) n est pas celui du document.'%N_GRP)

# ⛔ `ciqual.json` est un OBJET, pas une liste : les aliments vivent sous la cle `a`.
#    Le compter avec `len()` sur la racine rend 5 — et un garde qui cherche « 5 »
#    quelque part dans le texte serait VERT sans rien mesurer. Paye ici, une fois.
_CIQ = json.load(open(os.path.join(ROOT,'data','ciqual.json')))
_exige(isinstance(_CIQ, dict) and isinstance(_CIQ.get('a'), list),
       'la structure de `data/ciqual.json` a change : le compte d aliments n est plus mesurable.')
N_CIQUAL = len(_CIQ['a'])
# espace fine ou insecable selon la saisie : on compare sur les CHIFFRES, pas sur la typographie
_exige(re.sub(r'\D','',TXT).find(str(N_CIQUAL))>=0 or f'{N_CIQUAL:,}'.replace(',',' ') in TXT,
       'le nombre d aliments CIQUAL a change (%d) : le document annonce autre chose.'%N_CIQUAL)

N_WEBP = len([f for f in os.listdir(os.path.join(ROOT,'exercises')) if f.endswith('.webp')])
_exige(str(N_WEBP) in TXT, 'le nombre d illustrations d exercices a change (%d).'%N_WEBP)

N_ECRANS = len(set(re.findall(r"id=\"(s-[a-z]+)\"", IDX)))
_exige(N_ECRANS>=7, 'moins de 7 ecrans trouves (%d) : le document en annonce 7.'%N_ECRANS)

# ─── 2. LES QUOTAS — chaque chiffre relu dans le code ─────────────────────────
for nom, motif, val in (
    ('COACH_FREE_LIMIT',  r'COACH_FREE_LIMIT\s*=\s*(\d+)',  '10'),
    ('FOOD_AI_FREE_LIMIT',r'FOOD_AI_FREE_LIMIT\s*=\s*(\d+)','25'),
    ('PROG_FREE_LIMIT',   r'PROG_FREE_LIMIT\s*=\s*(\d+)',   '2'),
    ('HIST_FREE_LIMIT',   r'HIST_FREE_LIMIT\s*=\s*(\d+)',   '1'),
    ('BODYSCAN_FREE_LIMIT',r'BODYSCAN_FREE_LIMIT\s*=\s*(\d+)','2')):
    m = re.search(motif, SERVIS)
    _exige(m, '`%s` a disparu du code : le tableau des quotas du document devient faux.'%nom)
    _exige(m.group(1)==val, '`%s` vaut %s dans le code, le document annonce %s.'%(nom,m.group(1),val))

# ─── 3. LES MODELES — releves dans le Worker, pas de memoire ──────────────────
for action, modele in (('bloodTest','claude-sonnet-4-6'), ('bodyStudy','claude-sonnet-4-6'),
                       ('readBarcode','claude-haiku-4-5'), ('summarizeCoach','claude-haiku-4-5'),
                       ('estimateFood','claude-haiku-4-5')):
    m = re.search(r'async function '+action+r'\(', WK)
    _exige(m, 'la fonction `%s` a disparu du Worker : le tableau 3 devient faux.'%action)
    # ⛔ le corps REEL, borne par ses accolades — une borne en distance de caracteres
    #    n est pas une borne de fonction (BUGS.md §63, repaye une fois de plus ici).
    _i0 = WK.index('{', m.end()-1); _pp=0; _jj=_i0
    while _jj < len(WK):
        if WK[_jj]=='{': _pp+=1
        elif WK[_jj]=='}':
            _pp-=1
            if _pp==0: break
        _jj+=1
    corps = WK[_i0:_jj+1]
    _exige(modele in corps,
           'le modele de `%s` n est plus `%s` : le tableau 3 du document annonce ce modele.'%(action,modele))
_exige("importHistory'" in WK and "'history'" in WK,
       'le routage de l import d historique a change.')

# ─── 4. LES ABSENCES AFFIRMEES — un inventaire qui rate une capacite reelle nuit ─
_exige(not re.search(r'new Notification|showNotification|requestPermission|pushManager', SERVIS),
       'UNE API DE NOTIFICATION EST APPARUE dans le code : le document affirme qu il n y en a AUCUNE, '
       'et c est une conclusion business (retention). Il faut le corriger avant de l envoyer.')
_exige('dashboard.html' not in IDX,
       'UN LIEN VERS LE TABLEAU DE BORD GRAND ECRAN existe maintenant dans index.html : le document '
       'le declare NON ATTEIGNABLE.')
_exige('translations.js' not in IDX,
       '`translations.js` EST MAINTENANT CHARGE : le document declare l app monolingue.')
_exige('onclick="scanBarcode()"' not in IDX and 'onclick="openBarcodeScanner(' not in IDX,
       'LE BOUTON UTILISATEUR DU SCANNER EST REVENU : le document le declare reserve a l Admin.')
_exige(not re.search(r'onclick="[a-zA-Z_]*(supprimerCompte|deleteAccount|effacerCompte)', IDX),
       'UN BOUTON DE SUPPRESSION DE COMPTE existe maintenant : le document le signale comme le '
       'principal ecart RGPD. Corriger avant envoi.')
_exige(not re.search(r'\bfibres?\s*:', APP),
       'UN CHAMP FIBRES est apparu : le document affirme que seules 4 macros sont suivies.')

# ─── 5. LES PRESENCES AFFIRMEES ───────────────────────────────────────────────
for f, ou, quoi in (('_serieFaitFoiPourPR', LOG, 'l exclusion echauffement/echec des records'),
                    ('_rpeDeRir',           LOG, 'la conversion RIR/RPE a proprietaire unique'),
                    ('_debriefLocal',       LOG, 'le socle chiffre local du debrief'),
                    ('buildCoachContext',   COACH,'le contexte envoye a Milo'),
                    ('_eanValide',          APP, 'la cle de controle du code-barres'),
                    ('sbMirror',            _lire('supabase.js'), 'le miroir Supabase')):
    _exige(re.search(r'(?:async )?function '+f+r'\s*\(', ou),
           '`%s` a disparu : le document decrit %s.'%(f,quoi))
_exige(os.path.exists(os.path.join(ROOT,'dashboard.html')),
       '`dashboard.html` a disparu : le constat n.1 du document ne tient plus.')
_exige(os.path.exists(os.path.join(ROOT,'translations.js')),
       '`translations.js` a disparu : le constat n.2 du document ne tient plus.')
_exige(re.search(r'SET_TYPES\s*=\s*\[\s*\'N\'\s*,\s*\'É\'\s*,\s*\'X\'\s*\]', CONST),
       'les trois types de serie (N / E / X) ont change : le document les enumere.')

# ─── 6. LE DOCUMENT NE PROMET PAS CE QU IL NE PEUT PAS TENIR ──────────────────
import unicodedata
_SANS_ACCENT = ''.join(c for c in unicodedata.normalize('NFD', TXT.upper())
                       if unicodedata.category(c) != 'Mn')
for mot in ('NON ATTEINGNABLE', 'PARTIEL', 'A VERIFIER'):
    _exige(mot in _SANS_ACCENT,
           'le document ne porte plus la mention « %s » : un inventaire sans etats intermediaires '
           'presente des chantiers ouverts comme des capacites acquises.'%mot)

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
                  bottomMargin=13*mm,title='Inventaire fonctionnel Force Tracker',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes | %d exercices / %d groupes, %d aliments CIQUAL, %d illustrations)'
      %(OUT,VERSION,N_GARDES,N_EX,N_GRP,N_CIQUAL,N_WEBP))
