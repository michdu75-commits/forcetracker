#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PDF du banc iPhone du scanner. 26e document de la serie.
Tous les faits sont RELUS dans le code servi ; le generateur refuse de produire si l'un tombe.
Les gardes les plus utiles protegent des DECISIONS : que le bouton utilisateur reste absent,
que la porte soit gardee DANS la fonction, que Quagga2 ne passe pas en mode scene, que le
diagnostic n'invente pas d'autofocus, et que le verdict ne monte pas d'un cran.
CONTRAINTE : WinAnsi/cp1252 — pas d'emoji. Sortie hors depot (regle d'or #14)."""
import html, os, re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

ROOT = os.environ.get('FT_ROOT') or '/home/user/forcetracker'
OUT = os.environ.get('FT_OUT') or '/tmp/DOSSIER-GPT-BANC-IPHONE-SCANNER-14-09-2026.pdf'
APP = open(os.path.join(ROOT,'app.js'),encoding='utf-8').read()
IDX = open(os.path.join(ROOT,'index.html'),encoding='utf-8').read()
SW  = open(os.path.join(ROOT,'sw.js'),encoding='utf-8').read()
RUN = open(os.path.join(ROOT,'tests','parcours','runner.js'),encoding='utf-8').read()
DOC = open(os.path.join(ROOT,'docs','BANC-IPHONE-SCANNER.md'),encoding='utf-8').read()
VERSION = (re.search(r"const CACHE ?= ?'(ft-v\d+)'", SW) or [None,'?'])[1]

def nu(t):
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m:'\n'*m.group(0).count('\n'), t)
    return '\n'.join(l for l in t.split('\n') if not l.strip().startswith('//'))
def corps(n, s=None):
    s = s if s is not None else APP
    m = re.search(r'(?:async )?function '+n+r'\s*\(', s)
    if not m: return ''
    i=s.index('{',m.end()-1); p=0; j=i
    while j<len(s):
        if s[j]=='{': p+=1
        elif s[j]=='}':
            p-=1
            if p==0: return nu(s[i:j+1])
        j+=1
    return nu(s[i:])
APP_NU=nu(APP); IDX_NU=re.sub(r'<!--[\s\S]*?-->',' ',IDX); SW_NU=nu(SW)

# ═══ LA GARANTIE N.1 : LE BOUTON UTILISATEUR RESTE ABSENT ═══
if 'onclick="scanBarcode()"' in IDX or 'onclick="openBarcodeScanner(' in IDX:
    raise SystemExit('LE BOUTON UTILISATEUR DU SCANNER EST REVENU. Michel, 14/09 : « je ne veux '
                     'toujours PAS reactiver le bouton scanner pour les utilisateurs ». Ce '
                     'document decrit un banc de test, pas une mise en production.')
for _f in ('openBarcodeScanner','scanBarcode','_bcTraiterCode','_bcPrendreLaMain','_bcFusionnerCandidats'):
    if not re.search(r'(?:async )?function '+_f+r'\s*\(', APP):
        raise SystemExit('`%s` a disparu : c est la PORTE qui est fermee, pas le moteur.'%_f)
# ═══ LA PORTE DU BANC EST GARDEE *DANS* LA FONCTION ═══
if '_isAdminUnlocked()' not in corps('ouvrirBancScanner'):
    raise SystemExit('La porte du banc n est plus gardee DANS SA FONCTION : un bouton qui appelle '
                     'la fonction ne suffit pas — une porte gardee par son bouton n est pas gardee.')
if 'onclick="ouvrirBancScanner(' not in IDX:
    raise SystemExit('La carte Admin du banc a disparu : c est la SEULE porte vers les moteurs.')
# ═══ QUAGGA2 N EST JAMAIS EN MODE SCENE ═══
if not re.search(r'locate:\s*false', corps('_bcDecoderImage')) or re.search(r'locate:\s*true', APP_NU):
    raise SystemExit('QUAGGA2 EST PASSE EN MODE SCENE : mesure au banc, il y rend des EAN-8 de cle '
                     'VALIDE lus a l INTERIEUR d un EAN-13 (3083681011791 -> 11151791). Un code '
                     'faux dont la cle est juste ne peut etre attrape par RIEN en aval.')
if 'quagga' in corps('openBarcodeScanner').lower():
    raise SystemExit('Quagga2 tourne en CONTINU : 16x le CPU pour un gain qui n existe que sur les '
                     'images ratees par le moteur principal. Il ne doit tourner que sur la capture.')
# ═══ AUCUN REPLI MOTEUR SILENCIEUX ═══
for _m in ('Moteur demandé','Moteur réellement actif','Cause du repli'):
    if _m not in APP:
        raise SystemExit('Le diagnostic n affiche plus « %s » : croire qu on teste WebAssembly '
                         'alors que ZXing-js tourne est pire que ne pas tester du tout.'%_m)
# ═══ RIEN N EST INVENTE SUR L AUTOFOCUS ═══
_CC = corps('_bcCapacitesCamera')
if 'non observable' not in _CC:
    raise SystemExit('Le diagnostic camera n ecrit plus « non observable » : Michel a demande de '
                     'ne JAMAIS inventer un etat focus = OK quand l API ne le dit pas.')
for _a in ('getCapabilities','getSettings','getSupportedConstraints'):
    if _a not in _CC:
        raise SystemExit('`%s` a disparu du diagnostic camera : c est precisement ce qui manquait '
                         'dans le code avant ce chantier, et le defaut qu on corrige.'%_a)
if re.search(r"focus\s*=\s*['\"]continuous['\"]", _CC):
    raise SystemExit('LE DIAGNOSTIC RECOPIE LA CONTRAINTE DEMANDEE dans le champ OBSERVE : c est '
                     'exactement le faux OK que Michel interdit.')
# ═══ LE NUMERO COMPLET RESTE AFFICHE ═══
_RD = corps('_bcRenduDiag')
if not re.search(r'\(l\.code\s*\|\|', _RD) or re.search(r'produit trouv|Code trouv', _RD, re.I):
    raise SystemExit('LE NUMERO COMPLET N EST PLUS AFFICHE : c est LE premier critere du test reel, '
                     'parce qu un moteur peut rendre un EAN faux dont la cle est juste.')
# ═══ LE BANC N EST PAS UN SECOND CHEMIN ═══
_DI = corps('_bcDecoderImage')
for _m in ('_lookupBarcode','_bcFusionnerCandidats','_eanValide'):
    if _m in _DI:
        raise SystemExit('Le decodeur connait « %s » : il doit rendre un candidat brut et rien '
                         'de plus — sinon le banc devient un second chemin.'%_m)
if '_bcFusionnerCandidats(' not in corps('_bcTraiterCode'):
    raise SystemExit('`_bcTraiterCode` ne passe plus par la fusion : un mode test qui n emprunte '
                     'pas le chemin de production valide le mode test, pas la production.')
if re.search(r"createElement\(\s*['\"]canvas['\"]\s*\)", _DI) or 'putImageData' in _DI:
    raise SystemExit('UN PRETRAITEMENT EST REVENU dans le decodeur : le banc a mesure que le '
                     'recadrage central detruit tout (-100 %) et que la nettete fait PERDRE 12 et '
                     '26 cas aux deux meilleurs moteurs.')
# ═══ NUTRITION ET IA INTACTES ═══
for _f in ('_bcDecoderImage','_bcChargerMoteur','ouvrirBancScanner','_bcRenduDiag','_bcCapacitesCamera'):
    _c = corps(_f)
    for _m in ('_ref100','foodLog','_douaneLigne','savedFoods','_offFetchProduct','_resoudreNutrition'):
        if _m in _c:
            raise SystemExit('`%s` touche la nutrition (« %s ») : scanner = code, Nutrition = '
                             'produit.'%(_f,_m))
    for _m in ('estimateFoodAI','scanBarcodeIA','foodAiUses','AI_PROXY'):
        if _m in _c:
            raise SystemExit('`%s` touche un chemin IA (« %s ») : le chemin local doit rester a '
                             'ZERO appel IA.'%(_f,_m))
# ═══ CHARGEMENT PARESSEUX ═══
for _m in ('zxing_reader.wasm','quagga.min.js','zxing-wasm.js'):
    if "'./lib/%s'"%_m in SW_NU:
        raise SystemExit('`%s` est entre dans le PRECHARGEMENT du service worker : ~1,1 Mo '
                         're-telecharge par tout le monde a chaque version, pour des moteurs que '
                         'personne n atteint. Precedent CIQUAL, regle d or #4.'%_m)
if re.search(r'<script[^>]+lib/(zxing-wasm|quagga)', IDX_NU):
    raise SystemExit('Un moteur du banc est charge par une balise <script> : il partirait au '
                     'DEMARRAGE de l app.')
for _m in ('lib/zxing-wasm.js','lib/quagga.min.js'):
    if _m not in corps('_bcChargerMoteur'):
        raise SystemExit('`%s` n est plus charge par `_bcChargerMoteur` : le chargement doit rester '
                         'concentre dans un seul endroit.'%_m)
if 'html5-qrcode' in APP_NU.lower() or 'html5-qrcode' in IDX_NU.lower():
    raise SystemExit('Html5-QRCode est entre dans le code servi : le banc l a mesure comme une '
                     'REGRESSION (68,8 % contre 77,5 %).')
# ═══ LES TEMOINS EXISTENT ═══
N_XI = len(re.findall(r"t\('CCCXI [^']", RUN))
if N_XI < 18:
    raise SystemExit('Le bloc CCCXI est tombe a %d temoins : le document en annonce 18.'%N_XI)
# ═══ LE VERDICT NE MONTE PAS D UN CRAN ═══
_ACC = str.maketrans('àâäéèêëîïôöùûüç','aaaeeeeiioouuuc')
DP = DOC.lower().translate(_ACC).replace('’',"'")
if 'aucune reactivation utilisateur avant resultats iphone' not in DP:
    raise SystemExit('Le document a perdu la phrase de fin exigee par Michel.')
for _i in ('scanner reactive','mis en production','pret pour la production'):
    for _m in re.finditer(re.escape(_i), DP):
        _av = DP[max(0,_m.start()-60):_m.start()]
        if not re.search(r'\bne\b|\bpas\b|\bjamais\b|\baucun', _av):
            raise SystemExit('LE VERDICT MONTE D UN CRAN : « %s » est AFFIRME.'%_i)
for _f in ('non observable','getcapabilities','mode cadre','11151791','ciqual'):
    if _f not in DP:
        raise SystemExit('Le document a perdu un fait de fond : %s'%_f)

N_GARDES = len(re.findall(r'raise SystemExit', open(os.path.abspath(__file__),encoding='utf-8').read()))

ROUGE=colors.HexColor('#C0392B'); ENCRE=colors.HexColor('#1A1A1A')
GRIS=colors.HexColor('#5A5A5A'); FOND=colors.HexColor('#F4F4F2')
ss=getSampleStyleSheet()
S={'titre':ParagraphStyle('t',parent=ss['Title'],fontName='Helvetica-Bold',fontSize=19,leading=23,textColor=ENCRE,alignment=0,spaceAfter=2),
   'sous':ParagraphStyle('s',parent=ss['Normal'],fontName='Helvetica',fontSize=9.5,leading=13,textColor=GRIS,spaceAfter=10),
   'h':ParagraphStyle('h',parent=ss['Normal'],fontName='Helvetica-Bold',fontSize=12,leading=15,textColor=ROUGE,spaceBefore=12,spaceAfter=5),
   'p':ParagraphStyle('p',parent=ss['Normal'],fontName='Helvetica',fontSize=9.5,leading=13.5,textColor=ENCRE,spaceAfter=6),
   'petit':ParagraphStyle('pt',parent=ss['Normal'],fontName='Helvetica-Oblique',fontSize=8,leading=11,textColor=GRIS,spaceAfter=4),
   'cell':ParagraphStyle('c',parent=ss['Normal'],fontName='Helvetica',fontSize=8.3,leading=11,textColor=ENCRE),
   'cellb':ParagraphStyle('cb',parent=ss['Normal'],fontName='Helvetica-Bold',fontSize=8.3,leading=11,textColor=ENCRE)}
def _v(t):
    x=html.unescape(re.sub(r'<[^>]+>','',t))
    for i,ch in enumerate(x):
        try: ch.encode('cp1252')
        except UnicodeEncodeError:
            raise SystemExit('CARACTERE HORS cp1252 : %r (contexte %r)'%(ch,x[max(0,i-30):i+30]))
    return t
def P(t,st='p'): return Paragraph(_v(t),S[st])
def T(l,w,e=True):
    d=[[Paragraph(_v(c),S['cellb' if (e and i==0) else 'cell']) for c in ln] for i,ln in enumerate(l)]
    t=Table(d,colWidths=w)
    st=[('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#D8D8D4')),
        ('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),
        ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]
    if e: st.append(('BACKGROUND',(0,0),(-1,0),FOND))
    t.setStyle(TableStyle(st)); return t

H=[]
H.append(P('Le banc iPhone du scanner &mdash; un moteur interchangeable, pas un second chemin','titre'))
H.append(P('14/09/2026 &middot; Force Tracker %s &middot; %d gardes relisent le code servi et refusent '
           'de produire ce document si un fait tombe.'%(VERSION,N_GARDES),'sous'))

H.append(P('1. Ce que ce chantier fait, et ce qu il ne fait surtout pas','h'))
H.append(P('Le banc synthetique a designe une architecture (zxing-wasm principal, Quagga2 <b>cadre</b> '
           'en repli sur capture fixe, 91,3 % en duo). ⛔ Mais Safari/iOS, l autofocus reel et le '
           'comportement WebAssembly <b>n ont pas pu etre eprouves depuis un conteneur</b>. Ce chantier '
           'construit le moyen d aller les chercher sur un vrai telephone, <b>sans rouvrir le bouton '
           'scanner pour les utilisateurs</b>.'.replace('⛔','').strip(),'p'))
H.append(P('<b>Le choix qui decide de tout : ce n est PAS un second chemin.</b> Seul le <b>decodeur</b> '
           'devient un parametre. La machine a etats, le verrou, la fusion, la validation et le lookup '
           'restent <b>exactement</b> ceux de la production. <i>Un mode test qui n emprunte pas le '
           'chemin de production valide le mode test, pas la production.</i>','p'))

H.append(P('2. Le defaut que l audit a trouve, et qui EST le sujet du test','h'))
H.append(P('`openBarcodeScanner` demandait <b>advanced:[{focusMode:\'continuous\'}]</b> &mdash; or une '
           'contrainte <b>advanced</b> est <b>ignoree en silence</b> si elle n est pas supportee. '
           'Mesure : <b>ni getCapabilities() ni getSettings() n existaient nulle part dans app.js</b>. '
           '<b>On demandait l autofocus continu sans jamais savoir s il etait applique.</b> Le '
           'diagnostic lit desormais vraiment le navigateur, et ecrit litteralement <b>&laquo; non '
           'observable &raquo;</b> partout ou Safari ne repond pas &mdash; <i>jamais un faux OK</i>.','p'))

H.append(P('3. L acces : Profil &gt; Admin, et le garde est DANS la fonction','h'))
H.append(P('`_isAdminUnlocked()` garde deja <b>16 outils</b> de diagnostic. ⛔ Aucun drapeau, aucune '
           'route de test, aucun mecanisme nouveau (R13). <b>Et le garde vit dans la fonction, pas sur '
           'le bouton</b> : <i>une porte gardee par son bouton n est pas gardee</i> &mdash; on peut '
           'appeler la fonction depuis la console. La mutation qui retire ce garde fait rougir un '
           'temoin.'.replace('⛔','').strip(),'p'))

H.append(P('4. La chaine, inchangee','h'))
H.append(T([['etape','ce qui se passe'],
  ['camera','live pilote par ZXing-js (seul a savoir decoder une video) ; capture fixe decodee par le moteur ACTIF'],
  ['repli local','si le moteur principal echoue SUR LA CAPTURE : Quagga2 en mode cadre, sur la MEME image'],
  ['validation','`_eanValide()` &mdash; seul proprietaire de la cle de controle (R2)'],
  ['deduplication','AVANT le conflit : deux moteurs sur le meme code se CONFIRMENT'],
  ['fusion','aucun -&gt; 0 lookup &middot; valide -&gt; 1 lookup &middot; <b>conflit -&gt; 0 lookup</b>, les deux candidats nommes'],
  ['arret','en mode banc, la chaine s arrete sur l EAN valide : <i>le test compare des NUMEROS, il n enregistre pas des repas</i>']],
  [30*mm,136*mm]))
H.append(P('<b>Dit plutot que masque</b> : zxing-wasm n a pas de lecture continue a lui. Le flux reste '
           'pilote par ZXing-js ; <b>c est la capture fixe qui eprouve zxing-wasm seul</b>, et le '
           'diagnostic l affiche.','p'))

H.append(P('5. Ce que l iPhone affichera','h'))
H.append(T([['ligne','pourquoi elle existe'],
  ['<b>Moteur demande</b> / <b>Moteur reellement actif</b> / <b>Cause</b>',
   '⛔ en ROUGE s ils different. <i>Croire qu on teste WebAssembly alors que ZXing-js tourne est pire que ne pas tester du tout.</i>'.replace('⛔','').strip()],
  ['zxing-wasm charge &middot; Quagga2 charge','OUI/NON &mdash; pour savoir ce qui a vraiment ete telecharge'],
  ['Objectif &middot; Resolution reelle &middot; Cadence','ou <b>non observable</b>'],
  ['<b>Autofocus demande</b> / <b>Autofocus observe</b>','le coeur du test : <b>non observable</b> si Safari ne le dit pas'],
  ['Appels IA','doit rester <b>0</b> pendant tout le chemin local'],
  ['Lookups produit','rouge si &gt; 1 &mdash; la course live/capture fermee en ft-v1210'],
  ['<b>les 6 dernieres lectures</b>','voie &middot; moteur &middot; ms &middot; <b>LE NUMERO COMPLET en monospace</b> &middot; resultat de fusion']],
  [58*mm,108*mm]))
H.append(P('<b>Le numero complet n est jamais remplace par &laquo; produit trouve &raquo;</b> : c est '
           '<b>le</b> premier critere du test, parce que le banc a mesure qu un moteur peut rendre un '
           '<b>EAN faux dont la cle est juste</b> (3083681011791 -&gt; 11151791).','p'))

H.append(P('6. Chargement &mdash; le precedent etait deja ecrit','h'))
H.append(P('Les moteurs sont <b>hors du prechargement</b> du service worker. Le raisonnement etait '
           'deja ecrit trois lignes plus haut, pour CIQUAL : <i>&laquo; le prechargement tourne a '
           'CHAQUE mise a jour du cache &raquo;</i>. Les y mettre, ce serait <b>~1,1 Mo re-telecharge '
           'par tout le monde a chaque version</b>, pour des moteurs que <b>personne n atteint</b>. '
           'Mis en cache a la demande, charges seulement a l ouverture du banc (regle d or #4).','p'))

H.append(P('7. Temoins et mutations','h'))
H.append(P('<b>Bloc CCCXI, %d temoins.</b> Ils protegent des FRONTIERES, pas des comportements : le '
           'risque de ce chantier n est pas qu il marche mal, c est qu il devienne un second chemin '
           'qui contourne la fusion, ou qu un repli moteur silencieux fasse croire qu on teste '
           'WebAssembly. <b>Aucun parcours utilisateur ne peut voir ca.</b>'%N_XI,'p'))
H.append(P('<b>Controle negatif : 16 mutations, 16 mordent</b>, controle sain a 0 rouge avant ET apres, '
           'sur un arbre copie &mdash; dont : le bouton revient &middot; la porte n est plus gardee '
           '&middot; repli silencieux &middot; Quagga2 en mode scene &middot; le decodeur appelle le '
           'lookup &middot; un appel IA se glisse &middot; le .wasm entre dans le prechargement &middot; '
           'faux OK d autofocus &middot; le numero est masque &middot; la fusion est contournee.','p'))
H.append(P('<b>Et deux de mes gardes etaient AVEUGLES, c est le controle negatif qui l a dit.</b> (1) Le '
           'garde des pretraitements cherchait un <b>0.7 DANS le drawImage</b>, or la mutation le posait '
           'sur la ligne d avant : <i>un garde qui cherche la FORME d un pretraitement en ratera '
           'toujours une</i>. Remplace par l invariant juste et plus fort : <b>le decodeur ne fabrique '
           'aucun canvas</b>. (2) Le garde du numero verifiait la <b>presence</b> de `l.code`, qui survit '
           'parfaitement a `l.code ? \'produit trouve\' : ...` : <i>mentionner une variable n est pas '
           'l afficher</i>.','p'))
H.append(P('<b>Et ma correction du second etait fausse a son tour</b> : elle interdisait TOUT '
           '`l.code ?`, qui sert legitimement a choisir la <b>couleur</b> du texte &mdash; elle '
           'rougissait sur du code sain. <i>Un garde plus strict que la contrainte reelle refuse du '
           'travail juste.</i> Paye deux fois en cinq minutes.','p'))

H.append(P('8. Ce que je ne peux toujours pas mesurer d ici','h'))
H.append(P('<b>Safari/iOS &middot; WebAssembly sur iPhone &middot; l autofocus reel &middot; le passage '
           'en arriere-plan &middot; le comportement thermique.</b> C est exactement ce que ce banc '
           'existe pour aller chercher &mdash; et c est pour ca que la premiere chose a lire sur le '
           'telephone n est pas un resultat de lecture, mais la ligne <b>&laquo; moteur reellement '
           'actif &raquo;</b>.','p'))

H.append(Spacer(1,6))
H.append(P('<b>AUCUNE REACTIVATION UTILISATEUR AVANT RESULTATS IPHONE</b>','p'))
H.append(Spacer(1,6))
H.append(P('Protocole complet dans docs/BANC-IPHONE-SCANNER.md : 6 produits x 6 gestes, trois colonnes '
           'a noter, et le scenario central (live ne lit pas -&gt; on attend la mise au point -&gt; '
           'capture fixe lit) avec le moteur qui recupere le code. Ce PDF est produit par '
           'tools/gen_iphone_pdf.py : ses %d gardes relisent le code servi.'%N_GARDES,'petit'))

SimpleDocTemplate(OUT,pagesize=A4,leftMargin=20*mm,rightMargin=20*mm,topMargin=18*mm,
                  bottomMargin=16*mm,title='Le banc iPhone du scanner',author='Force Tracker').build(H)
print('OK %s  (%s, CCCXI %d temoins, %d gardes)'%(OUT,VERSION,N_XI,N_GARDES))
