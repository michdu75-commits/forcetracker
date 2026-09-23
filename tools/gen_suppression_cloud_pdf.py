#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/SUPPRESSION-QUI-NE-REMONTE-PAS.pdf — analyse ciblee d un seul defaut, 23/09/2026.

[*] CE DOSSIER NE PORTE AUCUNE DONNEE PERSONNELLE : il decrit un mecanisme de code. Il vit
donc DANS le depot, contrairement au dossier TDEE et a l audit forensique, qui portent le
profil d une personne reelle.

[!!] LE GARDE CENTRAL N EST PAS UN RECOMPTAGE, C EST UNE EXECUTION. Les quatre fusionneurs
sont EXTRAITS de Code.js et EXECUTES par node : si `_pn_(0, 2500)` cessait de rendre 2500,
le document ne sortirait pas. Un dossier qui affirme un comportement sans le rejouer affirme
un souvenir.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d emoji.
"""
import html, io, json, os, re, subprocess, sys, tempfile
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (KeepTogether, Paragraph, Preformatted, SimpleDocTemplate,
                                Spacer, Table, TableStyle)
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'SUPPRESSION-QUI-NE-REMONTE-PAS.pdf')
NB = 0
def garde(ok, msg):
    global NB
    NB += 1
    if not ok:
        sys.exit('GARDE %d : %s' % (NB, msg))

SERVIS = ['state.js', 'app.js', 'screens.js', 'coach.js', 'setup.js', 'tracking.js',
          'sw.js', 'Code.js']
SRC = {f: io.open(os.path.join(ROOT, f), encoding='utf-8').read() for f in SERVIS}
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SRC['sw.js']) or [None, '?'])[1]
garde(VERSION.startswith('ft-v'), 'la version servie ne se lit plus dans sw.js')
try:
    HEAD = subprocess.check_output(['git', '-C', ROOT, 'rev-parse', '--short', 'HEAD']).decode().strip()
except Exception:
    HEAD = 'INCONNU'
garde(HEAD != 'INCONNU', 'HEAD illisible : le dossier doit nommer l arbre mesure')
garde(subprocess.check_output(['git', '-C', ROOT, 'status', '--porcelain', '--'] + SERVIS).decode().strip() == '',
      'un fichier SERVI est modifie : le dossier affirme qu aucune correction n est appliquee')

# ══ 1. LES QUATRE FUSIONNEURS, EXTRAITS PUIS EXECUTES ═════════════════════════════════
FUS = {}
for nom in ('_ps_', '_pn_', '_pa_', '_po_'):
    m = re.search(r'function %s\(b, ?e\)\{.*?\n' % re.escape(nom), SRC['Code.js'])
    garde(m is not None, 'le fusionneur %s ne se lit plus dans Code.js' % nom)
    FUS[nom] = m.group(0).strip()
_js = '\n'.join(FUS.values()) + """
const out = {
  pn_0_sur_2500: _pn_(0, 2500), pn_0_sur_0: _pn_(0, 0), pn_2500_sur_0: _pn_(2500, 0),
  pn_null_sur_90: _pn_(null, 90), pn_undef_sur_90: _pn_(undefined, 90),
  ps_vide_sur_perte: _ps_('', 'perte'), ps_null_sur_perte: _ps_(null, 'perte'),
  ps_muscle_sur_perte: _ps_('muscle', 'perte'),
  pa_vide_sur_plein: JSON.stringify(_pa_([], ['force'])),
  po_vide_sur_plein: JSON.stringify(_po_({}, {sq: 100}))
};
console.log(JSON.stringify(out));
"""
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as fh:
    fh.write(_js); _tmp = fh.name
try:
    EX = json.loads(subprocess.check_output(['node', _tmp]).decode())
finally:
    os.unlink(_tmp)
garde(EX['pn_0_sur_2500'] == 2500, '_pn_(0, 2500) rend %r : le mecanisme decrit n existe plus' % EX['pn_0_sur_2500'])
garde(EX['pn_2500_sur_0'] == 2500, '_pn_(2500, 0) rend %r : une vraie valeur ne passe plus' % EX['pn_2500_sur_0'])
garde(EX['pn_0_sur_0'] == 0, '_pn_(0, 0) rend %r' % EX['pn_0_sur_0'])
garde(EX['ps_vide_sur_perte'] == 'perte', "_ps_('', 'perte') rend %r" % EX['ps_vide_sur_perte'])
garde(EX['ps_muscle_sur_perte'] == 'muscle', "_ps_ bloque desormais une vraie valeur")
garde(EX['pa_vide_sur_plein'] == '["force"]', '_pa_ ne protege plus un tableau rempli')
garde(EX['po_vide_sur_plein'] == '{"sq":100}', '_po_ ne protege plus un objet rempli')

# ══ 2. LES TROIS CHEMINS DE SUPPRESSION PROUVES ══════════════════════════════════════
garde('S.manualKcal=0;persist();closeKcalEdit();' in SRC['screens.js'].replace(' ', ''),
      'resetKcalAuto ne remet plus manualKcal a 0 dans screens.js')
garde('Calories remises en automatique' in SRC['screens.js'],
      'le message « Calories remises en automatique » a disparu')
garde('S.targetWeight=0;persist();' in SRC['tracking.js'].replace(' ', ''),
      'le retrait de l objectif de poids ne met plus targetWeight a 0')
garde('Objectif retiré' in SRC['tracking.js'], 'le message « Objectif retire » a disparu')
garde("S.goal2='';persist();" in SRC['setup.js'].replace(' ', ''),
      'le retrait automatique de goal2 a disparu de setup.js')

# ══ 3. CE QUI PART AU CLOUD ══════════════════════════════════════════════════════════
_c = SRC['setup.js'].replace(' ', '')
garde('manualKcal:S.manualKcal||0' in _c, 'le corps de synchro n envoie plus manualKcal||0')
garde('targetWeight:S.targetWeight||0' in _c, 'le corps de synchro n envoie plus targetWeight||0')

# ══ 4. CE QUE LE BACKEND EN FAIT ═════════════════════════════════════════════════════
_k = SRC['Code.js'].replace(' ', '')
garde('profile.manualKcal=_pn_(body.manualKcal,profile.manualKcal)' in _k,
      'manualKcal ne passe plus par _pn_ dans Code.js')
garde('profile.targetWeight=_pn_(body.targetWeight,profile.targetWeight)' in _k,
      'targetWeight ne passe plus par _pn_ dans Code.js')
N_PROT = len(re.findall(r'profile\.\w+\s*=\s*_(?:ps|pn|pa|po)_\(', SRC['Code.js']))
garde(N_PROT >= 30, 'seuls %d champs passent par un fusionneur' % N_PROT)

# ══ 5. LA RESTAURATION ═══════════════════════════════════════════════════════════════
garde('if(d.manualKcal)S.manualKcal=parseFloat(d.manualKcal)||0;' in _c,
      'la restauration de manualKcal a change de forme')
garde('if(d.targetWeight)S.targetWeight=parseFloat(d.targetWeight)||0;' in _c,
      'la restauration de targetWeight a change de forme')

# ══ 6. AUCUNE ROUTE D EFFACEMENT ═════════════════════════════════════════════════════
ACTIONS = sorted(set(re.findall(r"body\.action\s*===\s*'(\w+)'", SRC['Code.js'])))
garde(len(ACTIONS) > 20, 'seules %d actions lues dans Code.js' % len(ACTIONS))
EFFACE = [a for a in ACTIONS if re.search(r'delete|clear|remove|erase|purge', a, re.I)]
garde(not EFFACE, 'une route d effacement existe desormais : %r' % EFFACE)
garde('tombstone' not in SRC['Code.js'].lower(), 'un tombstone existe desormais dans Code.js')

# ══ 7. QUAND LA RESTAURATION S APPLIQUE ══════════════════════════════════════════════
N_APPLY = len(re.findall(r'_applyRestoreData\(', SRC['app.js']))
garde(N_APPLY >= 3, 'seulement %d appels a _applyRestoreData dans app.js' % N_APPLY)
garde('_localEmpty' in SRC['app.js'],
      'le garde _localEmpty a disparu : l auto-restauration ne serait plus bornee')

# ══ 8. GET ET POST ═══════════════════════════════════════════════════════════════════
N_PROFILE = len(re.findall(r"profile:\s*data\.profile\s*\|\|\s*\{\}", SRC['Code.js']))
garde(N_PROFILE == 2, 'les deux reponses loadProfile ne rendent plus profile a l identique (%d)' % N_PROFILE)

# ══ 9. LES POINTS CONNEXES, VERIFIES EUX AUSSI ═══════════════════════════════════════
garde('profile.healthProfile=body.healthProfile||profile.healthProfile||null' in _k,
      'healthProfile a change de motif : le point connexe du dossier serait faux')
_get = SRC['Code.js'][SRC['Code.js'].find('status:         \'ok\''):]
CONNEXE_GET = ('programmes:' not in _get[:1400])
garde(CONNEXE_GET, 'la reponse GET rend desormais programmes : le point connexe serait faux')

# ══ RENDU ════════════════════════════════════════════════════════════════════════════
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
 'p': ParagraphStyle('p', parent=SS['Normal'], fontName='Helvetica', fontSize=9.2,
                     leading=13, textColor=ENCRE, spaceAfter=5),
 'petit': ParagraphStyle('pt', parent=SS['Normal'], fontName='Helvetica', fontSize=8.1,
                         leading=11.2, textColor=GRIS, spaceAfter=4),
 'cell': ParagraphStyle('c', parent=SS['Normal'], fontName='Helvetica', fontSize=8, leading=10.4),
 'cellb': ParagraphStyle('cb', parent=SS['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10.4),
 'code': ParagraphStyle('co', parent=SS['Normal'], fontName='Courier', fontSize=7,
                        leading=8.7, textColor=ENCRE),
}
def _v(x, ou='texte'):
    x = str(x)
    for ch in x:
        try: ch.encode('cp1252')
        except UnicodeEncodeError: sys.exit('CARACTERE NON RENDU %r dans %s' % (ch, ou))
    for m in re.finditer(r'&([A-Za-z][A-Za-z0-9]{1,15});', x):
        c = html.unescape(m.group(0))
        if len(c) == 1:
            try: c.encode('cp1252')
            except UnicodeEncodeError: sys.exit('ENTITE NON RENDUE %s dans %s' % (m.group(0), ou))
    return x
def P(t, s='p'): return Paragraph(_v(t), stl[s])
def encadre(titre, corps, couleur=ROUGE):
    t = Table([[Paragraph('<b>%s</b>' % _v(titre), stl['cellb'])],
               [Paragraph(_v(corps), stl['cell'])]], colWidths=[168 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), FOND),
        ('LEFTPADDING', (0,0), (-1,-1), 8), ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LINEBEFORE', (0,0), (0,-1), 2.4, couleur), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
    return KeepTogether(t)
def tableau(entetes, ligs, larg):
    data = [[Paragraph('<b>%s</b>' % _v(h), stl['cellb']) for h in entetes]]
    for l in ligs: data.append([Paragraph(_v(c), stl['cell']) for c in l])
    t = Table(data, colWidths=larg, repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDEDEA')),
        ('GRID', (0,0), (-1,-1), 0.4, TRAIT), ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 4), ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 3.2), ('BOTTOMPADDING', (0,0), (-1,-1), 3.2)]))
    return t
def bloc_code(txt, legende=None):
    _v(txt, 'bloc de code')
    for l in txt.split('\n'):
        if stringWidth(l, 'Courier', 7.0) > 168 * mm - 12:
            sys.exit('LIGNE QUI DEBORDE (%d car) : %s' % (len(l), l[:70]))
    t = Table([[Preformatted(txt, stl['code'])]], colWidths=[168 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), FONDC),
        ('LEFTPADDING', (0,0), (-1,-1), 7), ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LINEBEFORE', (0,0), (0,-1), 2.0, TRAIT), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
    return KeepTogether([Paragraph(_v(legende), stl['petit']), t]) if legende else t
def pied(cv, doc):
    cv.saveState(); cv.setFont('Helvetica', 7.2); cv.setFillColor(GRIS)
    cv.drawString(21 * mm, 12 * mm, 'Une SUPPRESSION ne remonte jamais au cloud - Force Tracker %s '
                  '- 23/09/2026 - arbre %s - ANALYSE, aucune correction' % (VERSION, HEAD))
    cv.drawRightString(189 * mm, 12 * mm, 'page %d' % doc.page)
    cv.setStrokeColor(TRAIT); cv.setLineWidth(0.4); cv.line(21 * mm, 16 * mm, 189 * mm, 16 * mm)
    cv.restoreState()

H = []
H.append(P('Une suppression ne remonte jamais au cloud', 'titre'))
H.append(P('Analyse ciblee d un seul defaut - Force Tracker %s, arbre %s - 23 septembre 2026.<br/>'
  '[/!\\] <b>Analyse seulement.</b> Aucun code modifie, aucune correction appliquee, aucun bump.<br/>'
  'Ce dossier ne porte <b>aucune donnee personnelle</b> : il decrit un mecanisme de code.'
  % (VERSION, HEAD), 'sous'))

H.append(encadre('Le defaut en une phrase',
  'Quand quelqu un <b>retire</b> une valeur de son profil, l application envoie bien la suppression '
  'au serveur - mais le serveur la <b>refuse</b>, parce qu il ne sait pas distinguer '
  '&laquo; cette valeur a ete retiree &raquo; de &laquo; cet appareil ne la connait pas encore &raquo;. '
  '[*] L ancienne valeur reste donc au cloud, et <b>revient a la premiere restauration</b>. '
  '[!!] <b>La suppression n est pas perdue en transit : elle est refusee, en silence, sans trace.</b>',
  ROUGE))

H.append(P('1. Le mecanisme - quatre fusionneurs, executes et non decrits', 'h1'))
H.append(P('Le backend porte quatre garde-fous, ajoutes sous le titre <i>&laquo; le vide ne gagne '
  'jamais sur du rempli &raquo;</i> (<font face="Courier">Code.js:1535-1543</font>). Ils protegent '
  '<b>%d champs</b> du profil. [*] Ce document ne les decrit pas : il les <b>extrait de '
  '<font face="Courier">Code.js</font> et les execute</b> a chaque generation.' % N_PROT, 'p'))
H.append(bloc_code(
 "function _pn_(b, e){ if(b===undefined)return e; return (b&&b!==0)?b:(e||b||0); }\n"
 "function _ps_(b, e){ if(b===undefined)return e; return (b&&b!=='')?b:(e||b||''); }\n"
 "\n"
 "   _pn_(0, 2500)        -> %-8s   le 0 envoye est IGNORE, l ancien reste\n"
 "   _pn_(2500, 0)        -> %-8s   une vraie valeur, elle, passe\n"
 "   _pn_(0, 0)           -> %-8s   rien a proteger, le 0 passe\n"
 "   _pn_(undefined, 90)  -> %-8s   champ absent : ignore (voulu)\n"
 "   _ps_('', 'perte')    -> %-8s   la chaine vide est IGNOREE\n"
 "   _pa_([], ['force'])  -> %-8s   le tableau vide est IGNORE\n"
 "   _po_({}, {sq:100})   -> %-8s   l objet vide est IGNORE"
 % (EX['pn_0_sur_2500'], EX['pn_2500_sur_0'], EX['pn_0_sur_0'], EX['pn_undef_sur_90'],
    json.dumps(EX['ps_vide_sur_perte']), EX['pa_vide_sur_plein'], EX['po_vide_sur_plein']),
 'Les fusionneurs relus dans le code servi, puis EXECUTES par node a la generation de ce PDF :'))
H.append(Spacer(1, 3))
H.append(P('[!!] <b>Le garde-fou ne distingue pas &laquo; absente &raquo; de &laquo; retiree '
  '&raquo;.</b> Les deux arrivent au serveur sous la meme forme : <font face="Courier">0</font>, '
  '<font face="Courier">\'\'</font>, <font face="Courier">[]</font> ou '
  '<font face="Courier">{}</font>.', 'p'))

H.append(P('2. La chaine complete, ancre par ancre', 'h1'))
H.append(tableau(['Etape', 'Ce qui se passe', 'Ancre'],
 [['Suppression locale', '<font face="Courier">S.manualKcal = 0</font>', 'screens.js:2540'],
  ['Ce qui part au cloud', '<font face="Courier">manualKcal: S.manualKcal || 0</font> -&gt; <b>0</b>', 'setup.js:922'],
  ['Ce que le backend en fait', '<font face="Courier">_pn_(0, 2500)</font> -&gt; <b>2500</b>', 'Code.js:1669'],
  ['Ce qui reste au cloud', "<b>l ancienne valeur, intacte</b>", 'Script Properties'],
  ['A la restauration', '<font face="Courier">if(d.manualKcal)</font> : 2500 est <i>truthy</i> -&gt; '
   '<b>elle revient</b>', 'setup.js:3341'],
  ['Au prochain enregistrement', 'la valeur ressuscitee repart au cloud : <b>la suppression est '
   'definitivement perdue</b>', 'setup.js:922']],
 [38 * mm, 98 * mm, 32 * mm]))

H.append(P('3. Donnees concernees - trois chemins prouves, pas un de plus', 'h1'))
H.append(P('Le <b>mecanisme</b> couvre les %d champs proteges. Mais une suppression n est un probleme '
  'que s il existe un chemin pour l effectuer. <b>Trois sont prouves dans le code servi</b> :' % N_PROT, 'p'))
H.append(tableau(['Champ', 'Action', 'Ou', 'Forme de la suppression'],
 [['<b>manualKcal</b>', 'bouton &laquo; remettre en automatique &raquo;<br/>toast '
   '&laquo; Calories remises en automatique &raquo;', 'screens.js:2540', '<b>0</b>'],
  ['<b>targetWeight</b>', 'champ vide -&gt; toast &laquo; Objectif retire &raquo;',
   'tracking.js:753', '<b>0</b>'],
  ['goal2', 'retrait <b>automatique</b> quand l objectif devient incompatible - pas une action '
   'de la personne', 'setup.js:2727', "<font face=\"Courier\">''</font>"]],
 [26 * mm, 76 * mm, 30 * mm, 36 * mm]))
H.append(Spacer(1, 3))
H.append(P('[/!\\] <b>Pas de generalisation au reste du profil.</b> Pour les %d autres champs '
  'proteges, aucune action utilisateur qui les vide n a ete trouvee. <i>Absence de preuve, pas '
  'preuve d absence.</i>' % (N_PROT - 3), 'petit'))

H.append(P('4. Scenario utilisateur', 'h1'))
H.append(bloc_code(
 "AVANT          cible manuelle 2 500 kcal, posee il y a des mois\n"
 "               locale = 2 500   cloud = 2 500\n"
 "\n"
 "ACTION         Nutrition -> modifier la cible -> « Remettre en automatique »\n"
 "               toast : « Calories remises en automatique »\n"
 "\n"
 "ETAT LOCAL     S.manualKcal = 0  -> la cible redevient calculee        [ok]\n"
 "ETAT CLOUD     envoie 0 -> _pn_(0, 2500) -> reste 2 500                [X]\n"
 "\n"
 "RESTAURATION   changement de telephone, ou navigateur vide\n"
 "               _applyRestoreData : if(d.manualKcal) -> 2 500 revient\n"
 "\n"
 "RESULTAT       la cible calorique est de nouveau figee a 2 500 kcal.\n"
 "               Aucun message. Et le prochain enregistrement renvoie\n"
 "               2 500 au cloud : la suppression est perdue pour de bon."))
H.append(Spacer(1, 3))
H.append(encadre('Frequence reelle - ca ne mord pas tous les jours',
  '<font face="Courier">_applyRestoreData</font> est appele <b>%d fois</b> dans '
  '<font face="Courier">app.js</font>, et l auto-restauration silencieuse est <b>bornee par '
  '<font face="Courier">_localEmpty</font></b> : seances <b>et</b> records <b>et</b> programmes '
  'tous vides. [*] Le defaut se declenche donc a l <b>inscription</b>, a une <b>restauration '
  'explicite</b>, ou apres une <b>purge locale totale</b> - pas a chaque demarrage.' % N_APPLY, VERT))

H.append(P('5. Cause racine', 'h1'))
H.append(P('Le protocole de synchronisation <b>n a pas de representation de la suppression</b>. '
  'Un champ retire et un champ jamais renseigne arrivent au serveur sous la meme forme. Le '
  'garde-fou - ecrit pour une <b>bonne raison</b> : empecher un appareil non restaure d ecraser '
  'un profil rempli - tranche donc systematiquement en faveur de l ancienne valeur.', 'p'))
H.append(tableau(['Ce qu on a cherche', 'Resultat mesure'],
 [['Une route d effacement cote serveur',
   '<b>Aucune.</b> Les %d actions reconnues sont : %s' % (len(ACTIONS), ', '.join(ACTIONS))],
  ['Un tombstone, un marqueur de suppression', '<b>Aucun</b> - le mot n apparait pas dans Code.js'],
  ['Une valeur speciale reconnue comme &laquo; retire &raquo;', '<b>Aucune</b>'],
  ['Un horodatage pour arbitrer les conflits', '<b>Aucun</b>'],
  ['Une difference GET / POST sur ce point',
   '<b>Aucune</b> : les deux reponses rendent <font face="Courier">profile: data.profile || {}</font> '
   'a l identique (%d occurrences)' % N_PROFILE]],
 [52 * mm, 116 * mm]))

H.append(P('6. Rayon reel et severite', 'h1'))
H.append(tableau(['Classement', 'Avant', 'Apres analyse', 'Pourquoi'],
 [['Rayon', 'SYSTEMIQUE', '<b>MULTI-MOTEUR</b>',
   '<font face="Courier">manualKcal</font> pilote la cible calorique, les trois macros et le contexte '
   'de Milo - donc plusieurs moteurs. Mais <b>trois champs seulement</b> sont atteignables, sur '
   '<b>un seul chemin</b>. Le reste du profil n a pas de chemin de suppression prouve.'],
  ['Severite', 'MAJEUR', '<b>MAJEUR</b> (confirme)',
   'Malgre la faible frequence : c est <b>silencieux</b> (aucun message, aucune trace serveur), '
   '<b>irreversible</b> (le prochain enregistrement renvoie la valeur ressuscitee), et ca survient '
   '<b>quand la personne n a aucun repere</b> - sur un telephone neuf.']],
 [22 * mm, 24 * mm, 30 * mm, 92 * mm]))

H.append(P('7. Correction envisageable PLUS TARD - rien n est applique', 'h1'))
H.append(tableau(['Piste', 'Cout', 'Ce qu elle change'],
 [['<b>1. Un marqueur de suppression</b> : envoyer <font face="Courier">null</font> (et non '
   '<font face="Courier">0</font>) pour un retrait explicite, et faire de '
   '<font face="Courier">null</font> le seul cas reconnu comme &laquo; retire &raquo; par les '
   'quatre fusionneurs. <font face="Courier">undefined</font> reste &laquo; je ne sais pas &raquo;.',
   '<b>faible</b>', 'ne touche pas le garde-fou d origine'],
  ['2. Une liste <font face="Courier">_supprimes: [\'manualKcal\']</font> dans le corps de '
   '<font face="Courier">saveProfile</font>, traitee avant les fusionneurs.', 'moyen',
   'ajoute un champ au protocole'],
  ['3. Un <b>horodatage par champ</b> - la vraie reponse au probleme general.', '<b>eleve</b>',
   'change le format de stockage'],],
 [104 * mm, 20 * mm, 44 * mm]))
H.append(Spacer(1, 3))
H.append(encadre('La contrainte a ne pas perdre de vue',
  'Le garde-fou existe parce qu un appareil <b>non restaure</b> envoyait des champs vides et '
  '<b>ecrasait un profil rempli</b>. [*] <b>Toute correction doit garder ce cas ferme.</b> '
  '<i>Retirer le garde-fou pour laisser passer les suppressions rouvrirait le defaut qu il a ete '
  'ecrit pour fermer.</i>', ORANGE))

H.append(P('8. Points encore INCONNUS', 'h1'))
H.append(tableau(['Point', 'Pourquoi il reste inconnu'],
 [['Le comportement du backend <b>deploye</b>',
   '<font face="Courier">Code.js</font> est lu dans le depot, il n est pas execute ici : le proxy '
   'de ce conteneur n autorise que GitHub. Le raisonnement repose sur le <b>code source</b>, pas '
   'sur une reponse reelle du serveur.'],
  ['La valeur reellement stockee pour un compte donne', 'Les Script Properties ne sont pas observables d ici.'],
  ['Le miroir Supabase', 'Il recoit le blob entier (<font face="Courier">setup.js:910-915</font>) et '
   '<b>n a pas ete audite</b> : il pourrait se comporter autrement.'],
  ['Les %d autres champs proteges' % (N_PROT - 3),
   'Le mecanisme les couvre, mais aucun chemin de suppression n a ete prouve pour eux.']],
 [52 * mm, 116 * mm]))

H.append(P('9. Points connexes - notes, PAS suivis', 'h1'))
H.append(tableau(['Point connexe a verifier plus tard', 'Ancre'],
 [['<font face="Courier">healthProfile</font> est traite par '
   '<font face="Courier">body.healthProfile || profile.healthProfile || null</font>, <b>hors des '
   'quatre fusionneurs</b> - meme motif, sur une donnee de sante.', 'Code.js:1685'],
  ['La reponse <b>GET</b> de <font face="Courier">loadProfile</font> ne renvoie ni '
   '<font face="Courier">programmes</font>, ni <font face="Courier">exRestPref</font>, ni '
   '<font face="Courier">exSwaps</font>, la ou la <b>POST</b> les renvoie. Sans rapport avec la '
   'suppression, mais les deux routes ont diverge.', 'Code.js:1027 vs 1068']],
 [136 * mm, 32 * mm]))

H.append(Spacer(1, 6))
H.append(encadre('Etat du depot, verifie par git a la generation',
  '<b>AUCUN FICHIER SERVI N EST MODIFIE</b> (%s). Aucun bump - le cache sert toujours <b>%s</b>. '
  'Aucune publication. [*] <i>Ce dossier explique un mecanisme ; il ne corrige rien.</i>'
  % (', '.join(SERVIS), VERSION), VERT))
H.append(Spacer(1, 5))
H.append(P('Genere par <font face="Courier">tools/gen_suppression_cloud_pdf.py</font>. Ses <b>%d '
  'gardes</b> relisent chaque ancre dans le code servi et <b>refusent de produire</b> si un seul '
  'fait tombe. [!!] Le garde central n est pas un recomptage : les quatre fusionneurs sont '
  '<b>extraits de <font face="Courier">Code.js</font> et executes</b> - si '
  '<font face="Courier">_pn_(0, 2500)</font> cessait de rendre 2500, ce document ne sortirait pas.' % NB, 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                        topMargin=17 * mm, bottomMargin=20 * mm,
                        title='Une suppression ne remonte jamais au cloud - Force Tracker (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)

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
_lis = re.sub(r'\s+', ' ', ' '.join(x[1:-1] for x in re.findall(r'\((?:[^()\\]|\\.)*\)', _t)))
if re.search(r'&lt;b&gt;|<b>', _lis):
    os.remove(OUT); sys.exit('REFUS : balise en clair dans le PDF produit')
if len(_lis) < 6000:
    os.remove(OUT); sys.exit('REFUS : le PDF relu ne fait que %d caracteres lisibles' % len(_lis))
# [/!\] LES MOTS EXIGES SE VERIFIENT DANS LE TEXTE REELLEMENT RENDU, pas dans le source :
#    « Aucune route » n existe nulle part - la cellule dit « Une route d effacement cote
#    serveur » / « Aucune. ». Un garde qui cherche une phrase que le document n ecrit pas
#    refuse un document parfaitement juste.
for _m in ('elle est refusee', 'trois chemins prouves', 'MULTI-MOTEUR',
           'route d effacement cote serveur', 'garder ce cas ferme', 'AUCUN FICHIER SERVI',
           'Points encore INCONNUS', 'healthProfile', 'executes', 'tombstone'):
    if _m not in _lis:
        os.remove(OUT); sys.exit('REFUS : « %s » n est pas imprime dans le PDF' % _m)
print('   relu : %d caracteres lisibles sur %d pages, 0 flux manque' % (len(_lis), _np))
print('OK %s (%d gardes, %d octets)' % (OUT, NB, os.path.getsize(OUT)))
print('   fusionneurs EXECUTES : _pn_(0,2500)=%s  _ps_("","perte")=%s  | %d champs proteges, %d actions backend'
      % (EX['pn_0_sur_2500'], json.dumps(EX['ps_vide_sur_perte']), N_PROT, len(ACTIONS)))
