#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PDF de l'INCIDENT iPHONE du 15/09/2026 : un EAN-13 de cle valide jamais presente.
27e document de la serie.

⛔⛔ CE DOCUMENT DECRIT UNE ENQUETE, PAS UN CORRECTIF. Ses gardes les plus utiles protegent
donc une ABSENCE : qu aucune correction n ait ete appliquee en douce, que le document ne
monte pas d un cran sur ce qui n est pas prouve, et que les faits de code qu il affirme
soient RELUS dans le code servi a chaque generation.

Tous les chiffres sont recomptes depuis le code ou recalcules ici : longueurs, cles de
controle, distance entre les deux codes, nombre d appels du decodeur. Rien n est recopie.
CONTRAINTE : WinAnsi/cp1252 — pas d'emoji. Sortie hors depot (regle d'or #14)."""
import html, os, re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

ROOT = os.environ.get('FT_ROOT') or '/home/user/forcetracker'
OUT  = os.environ.get('FT_OUT')  or '/tmp/DOSSIER-GPT-INCIDENT-FAUX-EAN-15-09-2026.pdf'
APP = open(os.path.join(ROOT,'app.js'),encoding='utf-8').read()
IDX = open(os.path.join(ROOT,'index.html'),encoding='utf-8').read()
SW  = open(os.path.join(ROOT,'sw.js'),encoding='utf-8').read()
JT  = open(os.path.join(ROOT,'docs','JOURNAL-DE-TEST.md'),encoding='utf-8').read()
VERSION = (re.search(r"const CACHE ?= ?'(ft-v\d+)'", SW) or [None,'?'])[1]

def nu(t):
    """le CODE, debarrasse de ce qui en PARLE (famille ft-v1193/1203/1205/1210)."""
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m:'\n'*m.group(0).count('\n'), t)
    return '\n'.join(l for l in t.split('\n') if not l.strip().startswith('//'))
def corps(n, s=None):
    """le corps REEL d une fonction, borne par ses accolades — jamais une distance en
       caracteres (BUGS.md §63 : une borne en distance n est pas une borne de fonction)."""
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
APP_NU = nu(APP)

# ══════════════════════════════════════════════════════════════════════════════
#  LES GARDES — chacun refuse de produire le document si le fait qu il porte tombe
# ══════════════════════════════════════════════════════════════════════════════

# ─── 1. AUCUNE CORRECTION N A ETE APPLIQUEE (c est LA promesse de ce document) ───
_TC = corps('_bcTraiterCode')
if re.search(r'(confirmations|lecturesConsecutives|doubleLecture|_bcConfirme)', APP_NU):
    raise SystemExit('UNE CONFIRMATION MULTI-LECTURES A ETE AJOUTEE. Michel, 15/09 : « je ne veux '
                     'pas encore plusieurs lectures consecutives obligatoires ». Ce document dit '
                     'qu aucune correction n est appliquee — il mentirait.')
if re.search(r'setTimeout[^;]*_bcTraiterCode|_bcDelai', APP_NU):
    raise SystemExit('UN DELAI A ETE AJOUTE avant le traitement d un code. Interdit tant que le '
                     'mecanisme n est pas identifie (consigne du 15/09).')
if not re.search(r'if\(!_bcPrendreLaMain\(code\)\) return false;', _TC):
    raise SystemExit('LE VERROU A CHANGE dans `_bcTraiterCode` : le document decrit la machine a '
                     'etats telle qu elle etait pendant l incident.')

# ─── 2. LE MOTEUR : la voie LIVE ne passe JAMAIS par zxing-wasm ───
_N_DEC = len(re.findall(r'_bcDecoderImage', APP))
_CAPT  = corps('_bcCaptureFrame')
_N_DEC_CAPT = len(re.findall(r'_bcDecoderImage', _CAPT))
if _N_DEC != 3:
    raise SystemExit('`_bcDecoderImage` apparait %d fois au lieu de 3 (sa definition + 2 appels). '
                     'Le coeur du document est que la voie LIVE ne l appelle pas : ce compte est '
                     'la preuve, il doit etre recompte.'%_N_DEC)
if _N_DEC_CAPT != 2:
    raise SystemExit('Les 2 appels de `_bcDecoderImage` ne sont plus TOUS DEUX dans '
                     '`_bcCaptureFrame` (%d trouve(s)) : la demonstration « le live est ZXing-js » '
                     'ne tient plus.'%_N_DEC_CAPT)
_OPEN = corps('openBarcodeScanner')
if '_bcDecoderImage' in _OPEN:
    raise SystemExit('LA VOIE LIVE APPELLE MAINTENANT LE DECODEUR PARAMETRABLE : le fait central '
                     'du document (« le faux code vient de ZXing-js, pas de zxing-wasm ») est faux.')
if not re.search(r"voie:'live'[^}]*moteur:_bcMoteurActif", _OPEN):
    raise SystemExit('Le libelle de la voie LIVE a change. Le document affirme qu il ecrit la '
                     'GLOBALE `_bcMoteurActif` (ce qui a ete DEMANDE) et non le moteur qui a LU. '
                     'Si c est corrige, il faut le dire, pas le taire.')

# ─── 3. LE `ms` : deux grandeurs differentes dans la meme colonne ───
if not re.search(r"voie:'live'[^}]*ms:Date\.now\(\)-_bcT0", _OPEN):
    raise SystemExit('La voie LIVE n ecrit plus `Date.now()-_bcT0` dans `ms` : le document explique '
                     'que 22205 ms est un AGE DEPUIS L OUVERTURE, pas un temps de decodage.')
if not re.search(r"voie:'capture'[^}]*ms:r1\.ms", _CAPT):
    raise SystemExit('La voie CAPTURE n ecrit plus `r1.ms` dans `ms` : le contraste entre les deux '
                     'grandeurs (25/15 ms contre 22205 ms) est le point 2 du compte rendu.')
if '_bcT0=Date.now()' not in _OPEN.replace(' ',''):
    raise SystemExit('`_bcT0` n est plus pose a l ouverture du scanner : la signification de '
                     '22205 ms change.')
_DEC = corps('_bcDecoderImage')
if 'Date.now()-t0' not in _DEC.replace(' ',''):
    raise SystemExit('`_bcDecoderImage` ne mesure plus sa propre duree : le `ms` de la capture '
                     'cesserait d etre un temps de decodage.')

# ─── 4. LA FRAME N EST TOUJOURS PAS GARDEE (c est ce qui empeche de conclure) ───
_NOTE = corps('_bcDiagNote')
if not re.search(r't:Date\.now\(\)', _NOTE.replace(' ','')):
    raise SystemExit('`_bcDiagNote` ne stocke plus `t` : le document dit que l horodatage EXISTE '
                     'mais n est pas AFFICHE — c est l instrumentation minimale a ajouter.')
if re.search(r'(vignette|toDataURL)', _NOTE) or re.search(r"voie:'live'[^}]*(vignette|image|frame)", _OPEN):
    raise SystemExit('LA FRAME DECODEE EST MAINTENANT GARDEE : c est justement l instrumentation '
                     'PROPOSEE ET NON APPLIQUEE. Le document ne peut plus dire « on ne peut pas '
                     'departager A et F ».')

# ─── 5. `_eanValide` : rien d autre que longueur + cle ───
_EV = corps('_eanValide')
if not re.search(r"c\.length!==8 && c\.length!==12 && c\.length!==13", _EV.replace('  ',' ')):
    raise SystemExit('`_eanValide` a change de contrat de longueur : le point 4 du compte rendu '
                     'affirme qu elle ne teste QUE la longueur et la cle.')
if re.search(r'(prefixe|prefix|GS1|substr\(0,3\)|slice\(0,3\))', _EV):
    raise SystemExit('`_eanValide` teste maintenant un PREFIXE : le document explique qu elle n en '
                     'teste aucun — et qu un prefixe n aurait rien attrape (312 est un vrai '
                     'prefixe France).')
# la cle est RECALCULEE ici, jamais recopiee
def _cle(c):
    d=re.sub(r'\D','',str(c))
    if len(d) not in (8,12,13): return None
    s=sum(int(d[i])*(3 if (len(d)-2-i)%2==0 else 1) for i in range(len(d)-2,-1,-1))
    return (10-(s%10))%10 == int(d[-1])
VRAI, FAUX = '3760155219036', '3122632363883'
if _cle(VRAI) is not True:
    raise SystemExit('Le code REEL %s ne passe plus la cle de controle : recalcul casse.'%VRAI)
if _cle(FAUX) is not True:
    raise SystemExit('Le code FAUX %s ne passe plus la cle : tout le document repose sur le fait '
                     'qu il est FORMELLEMENT VALIDE.'%FAUX)
_COMMUNS = sum(1 for i in range(13) if VRAI[i]==FAUX[i])
if _COMMUNS != 1:
    raise SystemExit('La distance entre les deux codes a change (%d chiffre(s) commun(s) au lieu '
                     'de 1) : le point « ce n est pas une corruption du vrai code » tombe.'%_COMMUNS)

# ─── 6. LA FUSION : un seul candidat, aucune memoire ───
if not re.search(r'_bcFusionnerCandidats\(\[\{code:code, moteur:_bcMoteurActif\}\]\)', _TC):
    raise SystemExit('`_bcTraiterCode` ne construit plus un tableau A UN ELEMENT : le point 5 du '
                     'compte rendu (la fusion n a rien avec quoi refuser) ne tient plus.')
_FUS = corps('_bcFusionnerCandidats')
if re.search(r'(_bcDiag|lectures|precedent|historique)', _FUS):
    raise SystemExit('LA FUSION A MAINTENANT UNE MEMOIRE : c est une correction, et ce document '
                     'affirme qu aucune n a ete appliquee.')

# ─── 7. LE COMPTEUR « Lookups produit » compte des CODES ACCEPTES, pas des requetes ───
_i_inc  = _TC.find('_bcDiag.lookups++')
_i_banc = _TC.find('if(_bcBanc)')
_i_look = _TC.find('_lookupBarcode(')
if _i_inc < 0 or _i_banc < 0 or _i_look < 0:
    raise SystemExit('`_bcTraiterCode` a perdu l un de ses trois reperes (incrementation, retour '
                     'anticipe du banc, appel produit) : la correction n.1 du compte rendu ne peut '
                     'plus etre verifiee.')
if not (_i_inc < _i_banc < _i_look):
    raise SystemExit('L ORDRE A CHANGE dans `_bcTraiterCode`. Le document corrige Michel sur un '
                     'point precis : le compteur s incremente AVANT le retour du banc, donc en '
                     'mode banc AUCUNE requete produit ne part. Si l ordre change, cette '
                     'affirmation devient fausse.')

# ─── 8. LA PORTE UTILISATEUR RESTE FERMEE (regression, independante de l incident) ───
if 'onclick="scanBarcode()"' in IDX or 'onclick="openBarcodeScanner(' in IDX:
    raise SystemExit('LE BOUTON UTILISATEUR DU SCANNER EST REVENU. Le scanner vient de produire un '
                     'faux EAN sur un vrai telephone : c est le pire moment possible.')
if '_isAdminUnlocked()' not in corps('ouvrirBancScanner'):
    raise SystemExit('La porte du banc n est plus gardee DANS SA FONCTION.')

# ─── 9. L AUTOFOCUS : le diagnostic n invente toujours rien ───
_CC = corps('_bcCapacitesCamera')
if 'non observable' not in _CC:
    raise SystemExit('Le diagnostic camera n ecrit plus « non observable » : or c est lui qui a '
                     'permis de TRANCHER que Safari n expose pas focusMode.')
if re.search(r"focus\s*=\s*['\"]continuous['\"]", _CC):
    raise SystemExit('LE DIAGNOSTIC RECOPIE LA CONTRAINTE DEMANDEE dans le champ OBSERVE.')
if 'getCapabilities' not in _CC:
    raise SystemExit('`getCapabilities` a disparu : c est la mesure qui prouve que Safari repond '
                     '(le zoom en vient) et que focusMode n y est PAS.')

# ─── 10. LE DOCUMENT NE MONTE PAS D UN CRAN SUR CE QUI N EST PAS PROUVE ───
#      (garde applique au texte produit, plus bas : voir _CONTROLE_TEXTE)

# ─── 11. L INCIDENT EST BIEN AU JOURNAL DE TEST, AVEC SON ETAT REEL ───
if FAUX not in JT:
    raise SystemExit('L incident n est pas dans docs/JOURNAL-DE-TEST.md : regle d or #12, une '
                     'question sur le comportement se note TOUT DE SUITE.')
if 'PAS REPRODUIT' not in JT.upper().replace('É','E'):
    raise SystemExit('Le journal de test ne dit plus que l incident N EST PAS REPRODUIT : c est '
                     'l etat reel, et un document d etat faux fait dire des betises (R23).')

N_GARDES = len(re.findall(r'raise SystemExit', open(os.path.abspath(__file__),encoding='utf-8').read()))

# ══════════════════════════════════════════════════════════════════════════════
ROUGE=colors.HexColor('#C0392B'); ENCRE=colors.HexColor('#1A1A1A')
GRIS=colors.HexColor('#5A5A5A'); FOND=colors.HexColor('#F4F4F2')
ss=getSampleStyleSheet()
S={'titre':ParagraphStyle('t',parent=ss['Title'],fontName='Helvetica-Bold',fontSize=18,leading=22,textColor=ENCRE,alignment=0,spaceAfter=2),
   'sous':ParagraphStyle('s',parent=ss['Normal'],fontName='Helvetica',fontSize=9.5,leading=13,textColor=GRIS,spaceAfter=10),
   'h':ParagraphStyle('h',parent=ss['Normal'],fontName='Helvetica-Bold',fontSize=12,leading=15,textColor=ROUGE,spaceBefore=12,spaceAfter=5),
   'p':ParagraphStyle('p',parent=ss['Normal'],fontName='Helvetica',fontSize=9.5,leading=13.5,textColor=ENCRE,spaceAfter=6),
   'petit':ParagraphStyle('pt',parent=ss['Normal'],fontName='Helvetica-Oblique',fontSize=8,leading=11,textColor=GRIS,spaceAfter=4),
   'cell':ParagraphStyle('c',parent=ss['Normal'],fontName='Helvetica',fontSize=8.3,leading=11,textColor=ENCRE),
   'cellb':ParagraphStyle('cb',parent=ss['Normal'],fontName='Helvetica-Bold',fontSize=8.3,leading=11,textColor=ENCRE)}
def _valide(t):
    x=html.unescape(re.sub(r'<[^>]+>','',t))
    for i,ch in enumerate(x):
        try: ch.encode('cp1252')
        except UnicodeEncodeError:
            raise SystemExit('CARACTERE HORS cp1252 : %r (contexte %r)'%(ch,x[max(0,i-30):i+30]))
    return t
def P(t,st='p'): return Paragraph(_valide(t),S[st])
def T(l,w,e=True):
    d=[[Paragraph(_valide(c),S['cellb' if (e and i==0) else 'cell']) for c in ln] for i,ln in enumerate(l)]
    t=Table(d,colWidths=w)
    st=[('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#D8D8D4')),
        ('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),
        ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]
    if e: st.append(('BACKGROUND',(0,0),(-1,0),FOND))
    t.setStyle(TableStyle(st)); return t

ESSAIS_SONDES = 150 + 84 + 378     # scene vide / vrai code sortant du cadre / texture floue

H=[]
H.append(P('Incident iPhone &mdash; un EAN-13 de cle valide que personne n a presente','titre'))
H.append(P('15/09/2026 &middot; Force Tracker %s &middot; ENQUETE, AUCUNE CORRECTION APPLIQUEE. '
           '%d gardes relisent le code servi et refusent de produire ce document si un fait tombe.'
           %(VERSION,N_GARDES),'sous'))

H.append(P('0. Ce qui s est passe','h'))
H.append(P('Un seul code presente pendant tout le test : <b>%s</b> (un pot, etiquette nette). '
           'L historique du banc affiche pourtant :'%VRAI,'p'))
H.append(T([['voie','moteur affiche','ms affiche','code'],
  ['capture','zxing-wasm','25 ms','&mdash; rien lu &mdash;'],
  ['capture','zxing-wasm','15 ms','<b>%s</b>  (le vrai)'%VRAI],
  ['live','zxing-wasm','22205 ms','<b>%s</b>  &mdash; JAMAIS PRESENTE'%FAUX]],
  [22*mm,32*mm,22*mm,None]))
H.append(P('Et sur la capture d ecran prise au moment ou le faux code s affiche, la video montre '
           '<b>du tissu flou en mouvement, aucun code-barres</b>.','p'))

H.append(P('1. Deux affirmations du releve sont fausses, et elles changent la lecture','h'))
H.append(P('<b>(a) Aucune requete produit n est partie.</b> Recompte dans `_bcTraiterCode` : '
           '`_bcDiag.lookups++` s execute <b>avant</b> le retour anticipe du banc, et '
           '`_lookupBarcode` est <b>apres</b>. En mode banc elle n est donc <b>jamais appelee</b>. '
           'Le compteur &laquo; Lookups produit &raquo; compte des <b>codes acceptes</b>, pas des '
           'requetes reseau. <i>Le faux code n a rien cherche, rien enregistre, rien pollue.</i>','p'))
H.append(P('<b>(b) Le faux code ne vient pas de zxing-wasm, mais de ZXing-js.</b> `_bcDecoderImage` '
           'est la <b>seule</b> fonction qui appelle zxing-wasm ; elle apparait <b>%d fois</b> dans '
           'app.js (sa definition + <b>%d appels, tous deux dans `_bcCaptureFrame`</b>). La voie '
           'live passe le texte de ZXing-js <b>directement</b> a `_bcTraiterCode`. Le libelle ecrit '
           '`_bcMoteurActif` &mdash; une globale qui dit ce qui a ete <b>demande</b>, pas ce qui a '
           '<b>lu</b>.'%(_N_DEC,_N_DEC_CAPT),'p'))
H.append(P('Le commentaire du code disait &laquo; chaque frame est ensuite remise au moteur ACTIF '
           '&raquo;. <b>Le code ne le fait pas.</b> Le libelle a ete construit sur cette phrase. '
           '<i>Un libelle faux ne se contente pas de mentir : il oriente l enquete suivante.</i>','p'))

H.append(P('2. Ce que 22205 ms veut dire','h'))
H.append(T([['voie','ce que `ms` contient','source'],
  ['live','<b>age depuis l ouverture du scanner</b>','Date.now() - _bcT0, pose dans openBarcodeScanner'],
  ['capture','<b>duree reelle du decodage</b>','r1.ms, mesure a l interieur de _bcDecoderImage']],
  [22*mm,58*mm,None]))
H.append(P('<b>Deux grandeurs differentes dans la meme colonne.</b> Le panneau ecrit '
           '`(l.ms||0)+\' ms\'` pour les deux. La lecture fautive est donc survenue <b>22,2 s apres '
           'l ouverture</b> &mdash; coherent avec &laquo; le code n etait plus a l ecran &raquo;.','p'))

H.append(P('3. Quelle frame : non tracable, et c est le blocage','h'))
H.append(P('`_bcDiagNote` ne garde que <b>{t, voie, moteur, code, ms}</b> (+ px en capture). '
           '<b>Rien sur l image live</b> : pas de vignette, pas d horodatage de frame. L objet '
           '`result` de ZXing porte `getResultPoints()`, `getTimestamp()` et `getBarcodeFormat()` '
           '&mdash; <b>aucun n est lu</b>. Le `t` de chaque lecture <b>est</b> stocke, simplement '
           'pas affiche.','p'))
H.append(P('<b>Consequence directe</b> : la capture d ecran montre la scene <b>a l AFFICHAGE</b>, '
           'pas la frame decodee quelques centaines de ms plus tot. <i>On ne peut donc pas '
           'departager &laquo; frame floue du vrai code &raquo; de &laquo; scene sans code &raquo;.</i>','p'))

H.append(P('4. Pourquoi le faux code passe la validation','h'))
H.append(P('Recalcule ici, jamais recopie : <b>%s</b> &mdash; longueur 13, cle attendue = cle '
           'ecrite. `_eanValide` rend <b>true</b>. Elle ne teste <b>rien d autre</b> : ni prefixe '
           'GS1, ni plausibilite. Et <b>312 est un vrai prefixe France</b> &mdash; un controle de '
           'prefixe n aurait rien attrape non plus.'%FAUX,'p'))
H.append(P('<b>La fonction fait exactement son metier</b> : attraper une faute de frappe (~9 fois '
           'sur 10). Elle n a jamais ete concue pour attraper une <b>hallucination de decodeur</b>. '
           'Un nombre de 13 chiffres au hasard passe <b>1 fois sur 10</b>.','p'))

H.append(P('5. Pourquoi la fusion l accepte','h'))
H.append(P('`_bcTraiterCode` construit <b>toujours un tableau a UN element</b>. Donc : 1 moteur, '
           '1 candidat, confirme=1, recherches=1. L etat `conflit` exige <b>deux codes valides '
           'differents dans le MEME appel</b> &mdash; inatteignable en production. <b>Et la fusion '
           'n a aucune memoire</b> : le vrai code etait dans `_bcDiag.lectures`, elle ne le voit '
           'jamais. <i>On ne lui a donne aucune information avec laquelle refuser.</i>','p'))

H.append(P('6. Pourquoi une deuxieme acceptation : voulu, consequence non voulue','h'))
H.append(P('Le banc <b>re-arme expres</b> (`_bcSetEtat(\'SCANNING\')`, `_bcDernierCode=\'\'`) &mdash; '
           'commentaire : <i>on reste ouvert pour enchainer les essais</i>. En <b>production</b> le '
           'scanner <b>se ferme</b> au premier code valide : une seconde lecture est impossible. '
           'Donc re-armement <b>delibere</b>, compteur incremente <b>par accident</b>.','p'))

H.append(P('7. Verdict par hypothese','h'))
H.append(T([['hypothese','verdict'],
  ['E &mdash; le journal attribue le mauvais moteur','<b>PROUVEE</b> par lecture du code (recomptee par un garde de ce document)'],
  ['F &mdash; EAN valide depuis une scene sans code','<b>fortement soutenue</b> : la photo montre du tissu, et les deux codes n ont <b>%d chiffre commun sur 13</b> (le hasard en donne 1,3) : ce n est pas un code mal lu, c est un decodage independant. <b>Pas prouvee</b> : la photo date de l affichage, pas du decodage.'%_COMMUNS],
  ['A &mdash; frame floue du vrai code','<b>affaiblie</b> par le 1/13, mais pas morte : le telephone balayait du pot vers le tissu'],
  ['B &mdash; callback retarde d une vieille frame','<b>non prouvable</b> : rien n horodate la frame'],
  ['C &mdash; etat stale','<b>refutee pour l etat</b> (`_bcDernierCode` vide, fusion pure). Residu : `openBarcodeScanner` n appelle pas `closeBarcodeScanner` d abord.'],
  ['D &mdash; confusion live / capture','<b>refutee</b> : `voie` est un litteral a chaque site d appel']],
  [52*mm,None]))

H.append(P('8. Ce que les sondes disent, et ce qu elles ne disent pas','h'))
H.append(P('<b>%d essais synthetiques, 0 faux EAN</b> : scene sans code (150, <b>0 lecture</b>) &middot; '
           'vrai code sortant du cadre avec flou et barres parasites (84 &rarr; 59 lectures, '
           '<b>59 justes</b>) &middot; texture floue de bouge en 1080x1920 (378, <b>0 lecture</b>). '
           'Et l image de la capture elle-meme, donnee au vrai decodeur : <b>rien lu</b>. Le banc de '
           'ft-v1212 mesurait deja <b>0 faux EAN sur 414</b> pour ZXing-js.'
           .replace('&rarr;','-&gt;')%ESSAIS_SONDES,'p'))
H.append(P('<b>Donc le defaut existe sur un vrai capteur et pas sur nos images.</b> <i>Nos fixtures '
           'ne representent pas la frame qui l a produit</i> &mdash; et une premiere conclusion '
           '&laquo; hypothese refutee &raquo;, ecrite sur la seule foi de ces images, a du etre '
           'corrigee des l arrivee de la capture.','p'))

H.append(P('9. Le fait le plus inquietant n est pas le faux code','h'))
H.append(P('A <b>09:46</b>, le code est <b>net et bien cadre</b> dans le rectangle rouge : le live '
           '<b>ne le lit pas</b> (Lookups 0). A <b>09:49</b>, il &laquo; lit &raquo; du tissu. '
           '<b>Sur cette session, la voie live a produit 0 lecture juste et 1 fausse</b> &mdash; les '
           'deux lectures justes viennent des <b>captures</b>.','p'))

H.append(P('10. L autofocus, lui, est tranche','h'))
H.append(P('`getCapabilities()` <b>repond bien</b> sur Safari : le <b>Zoom 0.5-10</b> affiche en '
           'vient. Mais <b>focusMode n y figure pas</b>. Donc `advanced:[{focusMode:\'continuous\'}]` '
           'est <b>ignore en silence</b>. <i>&laquo; non observable &raquo; n etait pas un trou '
           'd instrumentation : c etait la reponse.</i> (Au passage : on demande 1920x1080, on '
           'obtient <b>1080x1920</b>.)','p'))

H.append(P('11. Instrumentation minimale &mdash; PROPOSEE, NON APPLIQUEE','h'))
H.append(T([['a ajouter','pourquoi'],
  ['<b>garder la frame decodee</b> (vignette en memoire, banc seulement)','la SEULE qui ferme A contre F'],
  ['afficher <b>T+..s</b> par lecture (le `t` existe deja)','separer l age du temps de decodage'],
  ['`voie:\'live\'` ecrit <b>\'zxing-js\'</b> en litteral','le libelle actuel est faux par construction'],
  ['lire `getBarcodeFormat()` et les `getResultPoints()`','une hallucination et une vraie lecture n ont pas la meme geometrie'],
  ['compter separement codes acceptes et requetes produit','le compteur actuel est un faux ami']],
  [66*mm,None]))

H.append(P('12. Correction minimale &mdash; PROPOSEE, NON APPLIQUEE','h'))
H.append(P('Un EAN de <b>cle valide</b> et de <b>prefixe valide</b> ne peut etre attrape par '
           '<b>rien</b> en aval. La correction n est donc ni dans la cle de controle, ni dans le '
           'lookup : elle serait dans une <b>fusion qui exige plus d une lecture</b> &mdash; '
           'precisement ce qui est mis de cote tant que le mecanisme n est pas identifie. '
           '<b>Aucune correction fonctionnelle n est donc proposee aujourd hui.</b>','p'))
H.append(P('La seule chose qualifiee de bug independamment du faux EAN : <b>le libelle de moteur '
           'faux</b>. Il corrompt toute mesure future &mdash; c est lui qui a fait croire que '
           'zxing-wasm tournait en live.','p'))

H.append(Spacer(1,6))
H.append(P('AUCUNE CORRECTION APPLIQUEE &middot; AUCUNE REACTIVATION UTILISATEUR &middot; '
           'HYPOTHESE F NON PROUVEE','h'))
H.append(P('Ce PDF est produit par tools/gen_incident_pdf.py : ses %d gardes relisent le code servi, '
           'recalculent les deux cles de controle et la distance entre les deux codes, et refusent '
           'de produire si une correction a ete appliquee en douce.'%N_GARDES,'petit'))

# ─── GARDE 10 (applique au TEXTE produit) : le document ne monte pas d un cran ───
_TEXTE = ' '.join(html.unescape(re.sub(r'<[^>]+>','',p.text)) for p in H if isinstance(p,Paragraph))
for _mot in ('AUCUNE CORRECTION APPLIQUEE','NON PROUVEE'):
    if _mot not in _TEXTE:
        raise SystemExit('Le document ne porte plus « %s » : c est la promesse qu il fait, et '
                         'un dossier qui monte d un cran sans mesure est exactement ce que ce '
                         'chantier cherche a eviter.'%_mot)
if re.search(r'(corrig[ée]e? le \d|correctif appliqu|est desormais corrig)', _TEXTE, re.I):
    raise SystemExit('Le document annonce un CORRECTIF : il decrit une enquete sans correction.')

SimpleDocTemplate(OUT,pagesize=A4,leftMargin=20*mm,rightMargin=20*mm,topMargin=18*mm,
                  bottomMargin=16*mm,title='Incident iPhone - faux EAN-13',author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, %d essais de sonde, %d chiffre commun/13)'
      %(OUT,VERSION,N_GARDES,ESSAIS_SONDES,_COMMUNS))
